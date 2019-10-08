const contourColors =
    [ '#210bac'
    , '#2732c4'
    , '#455bdc'
    , '#6583f3'
    , '#9faad3'
    , '#cfb39e'
    , '#e39968'
    , '#d96e4a'
    , '#c53b32'
    , '#b2151b'
    ]
    , plot = document.getElementById('plot')
    , plotLeft = 50
    , plotTop = 52
    , plotRight = 60
    , plotBottom = 45
    , numContours = 10
    , boundsButtons = document.querySelectorAll('input[name=bound]')
    , statsWindow = document.getElementById('stats-window')
    , statsWindowWidth = 186
    , statsWindowHeight = 90

let boundsType = floatParam('bounds')(2)
    , truthFromBoundsType = boundsType =>
        boundsType < 5 ? 0 : 1
    , truthFunc = truthFromBoundsType(boundsType)
boundsButtons[boundsType].checked = true
boundsType = boundsType % 5

const boundsNames =
    [ [ 'Lower Bounds on P(A, B)'
      , 'Upper Bounds on P(A, B)'
      , 'Bounds on P(A, B)'
      , 'Bounds Range on P(A, B)'
      , 'P(A, B) with A ⫫ B'
      ]
    , [ 'Lower Bounds on P(A ∨ B)'
      , 'Upper Bounds on P(A ∨ B)'
      , 'Bounds on P(A ∨ B)'
      , 'Bounds Range on P(A ∨ B)'
      , 'P(A ∨ B) with A ⫫ B'
      ]
    ]

const colorBarTitles =
    [ [ 'P(A, B) ≥'
      , 'P(A, B) ≤'
      , 'P(A, B) ≤'
      , 'Range'
      , 'P(A, B) ='
      ]
    , [ 'P(A ∨ B) ≥'
      , 'P(A ∨ B) ≤'
      , 'P(A ∨ B) ≥'
      , 'Range'
      , 'P(A ∨ B) ='
      ]
    ]

const title = truthFunc => boundsType =>
        boundsNames[truthFunc][boundsType]
    , titleXAxis = 'P(A)'
    , titleYAxis = 'P(B)'
    , titleColorBar = truthFunc => boundsType =>
        `${colorBarTitles[truthFunc][boundsType]}`

const coordX = plotWidth => x =>
        plotWidth * x + plotLeft
    , coordY = plotHeight => y =>
        plotHeight * (1 - y) + plotTop
    , coords = plotWidth => plotHeight => ([x, y]) =>
        [ plotWidth * x + plotLeft
        , plotHeight * (1 - y) + plotTop
        ]

const makeColorBar = n => draw => plotWidth => plotHeight => boundsType => {
const coords = coordsColorBar(plotHeight)(numContours)(boundsType)
return {
      boxes: mapRange(n)(i =>
        draw.rect(30, coords.boxes[i].height)
            .move(plotLeft + plotWidth + 7, plotTop + coords.boxes[i].y)
            .fill(contourColors[n - i - 1])
            .stroke({ color: 'black' })
      )
    , ticks: mapRange(n + 1)(i =>
        draw.text(`${round1(1 - i / numContours)}`)
            .opacity(coords.ticks[i] == -1 ? 0 : 1)
            .x(plotLeft + plotWidth + 40)
            .y(plotTop + coords.ticks[i] - 7)
            .font(
                { family: 'Open Sans'
                , size: 13
                , anchor: 'start'
                , color: 'rgb(60, 60, 60)'
                }
            )
      )
    }
}

const coordsColorBar = plotHeight => numContours => boundsType => {
const dispContours = boundsType == 3
    ? Math.floor(numContours / 2)
    : numContours
const tickSpace = plotHeight / dispContours
return {
      boxes:
        Array(numContours - dispContours).fill(
            { y: 0
            , height: 0
            }
        ).concat(mapRange(dispContours)(i =>
            ({ y: i * tickSpace
             , height: tickSpace + 1
             })
        ))
    , ticks:
        Array(numContours - dispContours).fill(-1)
            .concat(mapRange
                (dispContours + 1)
                (i => i * tickSpace)
            )
    }
}

const slopeDistances = [0, 0.0525, 0.07, 0.075, 0.075, 0.07, 0.06, 0.05, 0.05, 0.05, 0.05]
, pathM = x => y =>
    `M ${model.scaleX(x)} ${model.scaleY(y)}`
, pathL = x => y =>
    `L ${model.scaleX(x)} ${model.scaleY(y)}`
, pathH = x =>
    `H ${model.scaleX(x)}`
, pathV = y =>
    `V ${model.scaleY(y)}`
, pathC = x1 => y1 => x2 => y2 => x => y =>
    `C ${model.scaleX(x1)} ${model.scaleY(y1)} ${model.scaleX(x2)} ${model.scaleY(y2)} ${model.scaleX(x)} ${model.scaleY(y)}`
, pathCStraight = prevX => prevY => x => y =>
    pathC((prevX + x)/2)((prevY + y)/2)((prevX + x)/2)((prevY + y)/2)(x)(y)
, pathCStraightWithMid = prevX => prevY => x => y => {
    const midX = (prevX + x) / 2
    const midY = (prevY + y) / 2
    return [ 
          pathCStraight(prevX)(prevY)(midX)(midY)
        , pathCStraight(midX)(midY)(x)(y)
        ]
  }
, pathCDot = x => y =>
    pathC(x)(y)(x)(y)(x)(y)
, aAndBLowerBoundContour = n => i => x => xNext =>
    [ pathM(x)(1)
    , pathCStraight(x)(1)((1 + x)/2)(1 - (1 - x)/2)
    , pathCStraight((1 + x)/2)(1 - (1 - x)/2)(1)(x)
    , pathL(1)(xNext)
    , pathCStraight(1)(xNext)((i + 1 + n) / (2 * n))(1 - (n - i - 1) / (2 * n))
    , pathCStraight((i + 1 + n) / (2 * n))(1 - (n - i - 1) / (2 * n))(xNext)(1)
    , pathL(x)(1)
    ].join(' ')
, aAndBUpperBoundContour = n => i => x => xNext =>
    [ pathM(x)(1)
    , pathCStraight(x)(1)(x)(x)
    , pathCStraight(x)(x)(1)(x)
    , pathL(1)(xNext)
    , pathCStraight(1)(xNext)(xNext)(xNext)
    , pathCStraight(xNext)(xNext)(xNext)(1)
    , pathL(x)(1)
    ].join(' ')
, aAndBIndependentContour = n => i => x => xNext => {
    const mid = Math.sqrt(x)
        , midNext = Math.sqrt(xNext)
        , d = slopeDistances[i]
        , dNext = slopeDistances[i + 1]
    return [
          pathM(x)(1)
        , i == 0
            ? pathCStraight(0)(1)(0)(0)
            : pathC(x + d)(1 - d / x)(mid - d)(mid + d)(mid)(mid)
        , i == 0
            ? pathCStraight(0)(0)(1)(0)
            : pathC(mid + d)(mid - d)(1 - d / x)(x + d)(1)(x)
        , pathL(1)(xNext)
        , i == n - 1
            ? pathCDot(1)(1)
            : pathC(1 - dNext / xNext)(xNext + dNext)(midNext + dNext)(midNext - dNext)(midNext)(midNext)
        , i == n - 1
            ? pathCDot(1)(1)
            : pathC(midNext - dNext)(midNext + dNext)(xNext + dNext)(1 - dNext / xNext)(xNext)(1)
        , pathL(x)(1)
        ].join(' ')
  }
, aAndBDifferenceContour = n => i => x => xNext =>
    ( i < n / 2
        ? [ pathM(x)(1 - x)
          , pathCStraight(x)(1 - x)(x)(x)
          , pathCStraight(x)(x)(1 - x)(x)
          , pathL(1 - x)(xNext)
          , pathCStraight(1 - x)(xNext)(1 - x)(1 - x)
          , pathCStraight(1 - x)(1 - x)(xNext)(1 - x)
          , pathL(x)(1 - x)
          ]
        : [ pathM(0.5)(0.5)
          , pathCDot(0.5)(0.5)
          , pathCDot(0.5)(0.5)
          , pathL(0.5)(0.5)
          , pathCDot(0.5)(0.5)
          , pathCDot(0.5)(0.5)
          , pathL(0.5)(0.5)
          ]
    ).join(' ')
, aOrBLowerBoundContour = n => i => x => xNext =>
    [ pathM(0)(x)
    , pathCStraight(0)(x)(x)(x)
    , pathCStraight(x)(x)(x)(0)
    , pathL(xNext)(0)
    , pathCStraight(xNext)(0)(xNext)(xNext)
    , pathCStraight(xNext)(xNext)(0)(xNext)
    , pathL(0)(x)
    ].join(' ')
, aOrBUpperBoundContour = n => i => x => xNext =>
    [ pathM(0)(x)
    , pathCStraightWithMid(0)(x)(x)(0)
    , pathL(xNext)(0)
    , i == n - 1
        ? [ pathCStraight(xNext)(0)(1)(1)
          , pathCStraight(1)(1)(0)(1)
          ]
        : pathCStraightWithMid(xNext)(0)(0)(xNext)
    , pathL(0)(x)
    ].flat().join(' ')
, aOrBIndependentContour = n => i => x => xNext => {
    const mid = 1 - Math.sqrt(1 - x)
        , midNext = 1 - Math.sqrt(1 - xNext)
        , slopePb = x - 1 // slope along P(A) axis is 1/slopePb
        , slopePbNext = xNext - 1
        , d = slopeDistances[n - i]
        , dNext = slopeDistances[n - i - 1]
    return [
          pathM(0)(x)
        , i == 0
            ? pathCDot(0)(0)
            : pathC(-d / slopePb)(x - d)(mid - d)(mid + d)(mid)(mid)
        , i == 0
            ? pathCDot(0)(0)
            : pathC(mid + d)(mid - d)(x - d)(-d / slopePb)(x)(0)
        , pathL(xNext)(0)
        , i == n - 1
            ? pathCStraight(1)(0)(1)(1)
            : pathC(xNext - dNext)(-dNext / slopePbNext)(midNext + dNext)(midNext - dNext)(midNext)(midNext)
        , i == n - 1
            ? pathCStraight(1)(1)(0)(1)
            : pathC(midNext - dNext)(midNext + dNext)(-dNext / slopePbNext)(xNext - dNext)(0)(xNext)
        , pathL(0)(x)
        ].join(' ')
  }

const coordsContours =
[ [ n => mapRange(n)(i => aAndBLowerBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aAndBUpperBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aAndBUpperBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aAndBDifferenceContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aAndBIndependentContour(n)(i)(i/n)((i+1)/n))
  ]
, [ n => mapRange(n)(i => aOrBLowerBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aOrBUpperBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aOrBLowerBoundContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aAndBDifferenceContour(n)(i)(i/n)((i+1)/n))
  , n => mapRange(n)(i => aOrBIndependentContour(n)(i)(i/n)((i+1)/n))
  ]
]

const coordsLowerBoundLines = n =>
[ mapRange(n)(i => 
    [ [ i/n, 1 ]
    , [ 1, i/n ]
    ]
  )
, mapRange(n)(i =>
    [ [ 0, i/n ]
    , [ i/n, 0 ]
    ]
  )
]

const conjLowerBound = pa => pb =>
round2(Math.max(0, pa + pb - 1))

const conjUpperBound = pa => pb =>
round2(Math.min(pa, pb))

const conjUpperLowerDiff = pa => pb =>
round2(Math.min(pa, pb) - Math.max(0, pa + pb - 1))

const conjIndependent = pa => pb =>
round2(pa * pb)

const disjLowerBound = pa => pb =>
round2(Math.max(pa, pb))

const disjUpperBound = pa => pb =>
round2(Math.min(1, pa + pb))

const disjUpperLowerDiff = pa => pb =>
round2(Math.min(1, pa + pb) - Math.max(pa, pb))

const disjIndependent = pa => pb =>
round2(pa + pb - pa * pb)

const stats = e => {
const unitSquareX = e.pageX - model.unitSquareRect.left
const unitSquareY = e.pageY - model.unitSquareRect.top
const pa = unitSquareX / model.plotWidth
const pb = 1 - unitSquareY / model.plotHeight
statsWindow.style.left = `${unitSquareX + plotLeft - statsWindowWidth/2}px`
statsWindow.style.top = `${unitSquareY + plotTop - statsWindowHeight - 15}px`
statsWindow.style.display = 'block'
statsWindow.innerHTML = truthFunc == 0
    ? `P(A) = ${round2(pa)}<br>P(B) = ${round2(pb)}<br>${conjLowerBound(pa)(pb)} ≤ P(A,B) ≤ ${conjUpperBound(pa)(pb)}<br>Range = ${conjUpperLowerDiff(pa)(pb)}<br>P(A,B) = ${conjIndependent(pa)(pb)} (A⫫B)`
    : `P(A) = ${round2(pa)}<br>P(B) = ${round2(pb)}<br>${disjLowerBound(pa)(pb)} ≤ P(A∨B) ≤ ${disjUpperBound(pa)(pb)}<br>Range = ${disjUpperLowerDiff(pa)(pb)}<br>P(A∨B) = ${disjIndependent(pa)(pb)} (A⫫B)`
}

const noStats = e =>
statsWindow.style.display = 'none'

const makePolygons = draw => contours =>
contours.map((contour, i) =>
    draw.path(contour)
        .fill(contourColors[i])
        .stroke({ color: contourColors[i] })
        .on('mousemove', stats)
        .on('touchmove', stats)
        .on('mouseleave', noStats)
        .on('touchleave', noStats)
)

const makeLowerBoundLines = draw => lines => boundsType =>
lines[truthFunc].map((line, i) =>
    [ draw.line(line)
        .stroke(
            { width: 2
            , color: 'black'
            }
        )
        .opacity(boundsType == 2 || boundsType == 7
            ? 0.9
            : 0
        )
    , draw.line(line)
        .stroke(
            { dasharray: [ 15, 15 ]
            , width: 2
            , color: contourColors[i]
            }
        )
        .opacity(boundsType == 2 || boundsType == 7
            ? 0.9
            : 0
        )
    ]
).flat()

const model = {}

const createGraph = plot => boundsType => {
const width = Math.min(plot.scrollWidth, 640)
    , height = width - 13
model.draw = SVG().addTo(plot).size(width, height)
model.plotWidth = width - plotLeft - plotRight
model.plotHeight = height - plotTop - plotBottom
model.plotRect = plot.getBoundingClientRect()
model.unitSquare = model.draw
    .rect(model.plotWidth, model.plotHeight)
    .move(plotLeft, plotTop)
    .fill('white')
    .on('mousemove', stats)
    .on('touchmove', stats)
    .on('mouseleave', noStats)
    .on('touchleave', noStats)
model.unitSquareRect = document.querySelector('rect').getBoundingClientRect()
model.scaleX = coordX(model.plotWidth)
model.scaleY = coordY(model.plotHeight)
model.unitCoords = coords(model.plotWidth)(model.plotHeight)
model.contours = coordsContours
    .map(conjOrDisj => conjOrDisj
        .map(contours => contours(numContours))
    )
model.lowerBoundLinesCoords =
    coordsLowerBoundLines(numContours)
        .map(conjOrDisj => conjOrDisj
            .map(line => line.map(model.unitCoords))
        )
model.polygons = makePolygons
    (model.draw)
    (model.contours[truthFunc][boundsType])
model.lowerBoundLines = makeLowerBoundLines
    (model.draw)
    (model.lowerBoundLinesCoords)
    (boundsType)
model.draw.line
    ( plotLeft - 1
    , plotTop
    , plotLeft - 1
    , plotTop + model.plotHeight + 1
    ).stroke({ color: 'black' })
model.draw.line
    ( plotLeft - 1.5
    , plotTop + model.plotHeight + 1
    , plotLeft + model.plotWidth + 0.5
    , plotTop + model.plotHeight + 1
    ).stroke({ color: 'black' })
model.title = model.draw.text(title(truthFunc)(boundsType))
    .move(plotLeft + model.plotWidth/2, plotTop/2 - 17)
    .font({ size: 24, anchor: 'middle', family: 'Open Sans' })
model.draw.text(titleXAxis)
    .move(plotLeft + model.plotWidth/2, plotTop + model.plotHeight + 25)
    .font({ size: 16, anchor: 'middle', family: 'Open Sans' })
model.draw.text(titleYAxis)
    .move(plotLeft - 40, plotTop + model.plotHeight/2)
    .font({ size: 16, anchor: 'middle', family: 'Open Sans' })
    .transform({ rotate: -90 })
model.titleColorBar = model.draw.text(titleColorBar(truthFunc)(boundsType))
    .move(plotLeft + model.plotWidth + 30, plotTop - 25)
    .font({ size: 13, anchor: 'middle', family: 'Open Sans' })
const tickSpace = model.plotHeight / numContours
mapRange(numContours + 1)(i => {
    model.draw.line(
        [ [ plotLeft - 2, plotTop + i*tickSpace ]
        , [ plotLeft - 5, plotTop + i*tickSpace ]
        ]
    ).stroke({ color: 'black' })
    model.draw.line(
        [ [ plotLeft + i*tickSpace, plotTop + model.plotHeight + 2 ]
        , [ plotLeft + i*tickSpace, plotTop + model.plotHeight + 6 ]
        ]
    ).stroke({ color: 'black' })
    model.draw.text(`${round1(1 - i / numContours)}`)
        .move(plotLeft - 7, plotTop + i*tickSpace - 7)
        .font(
            { family: 'Open Sans'
            , size: 13
            , anchor: 'end'
            , color: 'rgb(60, 60, 60)'
            }
        )
    model.draw.text(`${round1(i / numContours)}`)
        .move(plotLeft + i*tickSpace, plotTop + model.plotHeight + 7)
        .font(
            { family: 'Open Sans'
            , size: 13
            , anchor: 'middle'
            , color: 'rgb(60, 60, 60)'
            }
        )
})
model.colorBar = makeColorBar(numContours)(model.draw)(model.plotWidth)(model.plotHeight)(boundsType)
}

const updateColorBar = numContours => colorBar => coords => {
colorBar.boxes.map((box, i) =>
    box.animate(1000)
        .y(plotTop + coords.boxes[i].y)
        .height(coords.boxes[i].height)
)
colorBar.ticks.map((tick, i) =>
    tick.animate(1000)
        .opacity(coords.ticks[i] == -1 ? 0 : 1)
        .cy(plotTop + coords.ticks[i])
)
}

const updatedTruthFunc = newTruthFunc => {
truthFunc = newTruthFunc
updatedBounds(boundsType)
}

const updatedBounds = newBoundsType => {
truthFunc = truthFromBoundsType(newBoundsType)
boundsType = newBoundsType % 5
const contours =
    model.contours[truthFunc][boundsType]
model.polygons.map((polygon, i) =>
    polygon.animate(1000).plot(contours[i])
)
model.lowerBoundLines.map((line, i) =>
    line.animate(1000)
        .plot(boundsType == 2
            ? model.lowerBoundLinesCoords[truthFunc][Math.floor(i/2)]
            :
                [ model.unitCoords([1, 1])
                , model.unitCoords([1, 0])
                ]
        )
        .opacity(boundsType == 2 ? 0.9 : 0)
)
updateColorBar
    (numContours)
    (model.colorBar)
    (coordsColorBar
        (model.plotHeight)
        (numContours)
        (boundsType)
    )
model.title.text(title(truthFunc)(boundsType))
model.titleColorBar.text(titleColorBar(truthFunc)(boundsType))
}

createGraph(plot)(boundsType)

addEventListeners(boundsButtons)('input')(updatedBounds)
