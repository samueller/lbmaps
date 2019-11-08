const width = height = 575
    , marginLeft = marginBottom = 50
    , marginTop = marginRight = 25
    , svgRect = document.getElementById('axes').getBoundingClientRect()
    , probLocationRadius = 6
    , plotLeft = marginLeft
    , plotRight = width - marginRight + 1
    , plotTop = marginTop
    , plotBottom = height - marginBottom + 1
    , plotWidth = plotRight - plotLeft
    , plotHeight = plotBottom - plotTop
    , scaleX = d3.scaleLinear()
        .range([plotLeft, plotRight])
        .domain([0, 1])
    , scaleY = d3.scaleLinear()
        .range([plotBottom, plotTop])
        .domain([0, 1])
    , leftEdge = scaleX(0)
    , rightEdge = scaleX(1)
    , bottomEdge = scaleY(0)
    , topEdge = scaleY(1)
    , axisLeft = d3.axisLeft(scaleY)
    , axisRight = d3.axisRight(scaleY)
    , axisTop = d3.axisTop(scaleX)
    , axisBottom = d3.axisBottom(scaleX)
    // , pscmSlider = document.getElementById('pscm-slider')
    // , pscmpSlider = document.getElementById('pscmp-slider')
    , pxSlider = document.getElementById('px-slider')
    , pmSlider = document.getElementById('pm-slider')
    , pycxmSlider = document.getElementById('pycxm-slider')
    , pycxmpSlider = document.getElementById('pycxmp-slider')
    , pycxpmSlider = document.getElementById('pycxpm-slider')
    , pycxpmpSlider = document.getElementById('pycxpmp-slider')
    // , pscmOutput = document.getElementById('pscm-output')
    // , pscmpOutput = document.getElementById('pscmp-output')
    , pxOutput = document.getElementById('px-output')
    , pmOutput = document.getElementById('pm-output')
    , pycxmOutput = document.getElementById('pycxm-output')
    , pycxmpOutput = document.getElementById('pycxmp-output')
    , pycxpmOutput = document.getElementById('pycxpm-output')
    , pycxpmpOutput = document.getElementById('pycxpmp-output')
    // , pyxOutput = document.getElementById('pyx-output')
    // , psOutput = document.getElementById('ps-output')
    // , pyOutput = document.getElementById('py-output')
    // , pxyOutput = document.getElementById('pxy-output')
    , model =
        { //pscm: +pscmSlider.value
        // , pscmp: +pscmpSlider.value
          px: +pxSlider.value
        , pm: +pmSlider.value
        , pycxm: +pycxmSlider.value
        , pycxmp: +pycxmpSlider.value
        , pycxpm: +pycxpmSlider.value
        , pycxpmp: +pycxpmpSlider.value
        }
    , textWithSub = pre => sub => post => textNode => {
        textNode.text(pre)
        textNode.append('tspan').attr('class', 'sub').attr('dy', '0.3em').text(sub)
        textNode.append('tspan').attr('dy', '-0.21em').text(post)
    }
    , drawAxes = svg => {
        svg.append('g')
            .attr('class', 'x-axis bottom')
            .attr('transform', `translate(${[0, plotBottom]})`)
            .call(axisBottom)
        svg.append('g')
            .attr('class', 'x-axis top')
            .attr('transform', `translate(${[0, plotTop]})`)
            .call(axisTop)
        svg.append('g')
            .attr('class', 'y-axis left')
            .attr('transform', `translate(${[plotLeft, 0]})`)
            .call(axisLeft)
        svg.append('g')
            .attr('class', 'y-axis right')
            .attr('transform', `translate(${[plotRight, 0]})`)
            .call(axisRight)
        svg.append('text')
            .attr('class', 'axis-label')
            .text('P(s|m)')
            .attr('transform', `translate(${[plotLeft + plotWidth/2, plotBottom + 40]})`)
        svg.append('text')
            .attr('class', 'axis-label')
            .text('P(s|m\')')
            .attr('transform', `translate(${[plotLeft - 40, plotTop + plotHeight/2]}) rotate(-90)`)
        return svg
    }
    // , drawGridLines = svg => {
    //     svg.selectAll('line.grid.x')
    //         .data(d3.range(0.1, 1, 0.1))
    //         .join('line')
    //         .attr('class', 'grid x')
    //         .attr('x1', scaleX)
    //         .attr('x2', scaleX)
    //         .attr('y1', bottomEdge)
    //         .attr('y2', topEdge)
    //         .call(events)
    //     svg.selectAll('line.grid.y')
    //         .data(d3.range(0.1, 1, 0.1))
    //         .join('line')
    //         .attr('class', 'grid y')
    //         .attr('x1', leftEdge)
    //         .attr('x2', rightEdge)
    //         .attr('y1', scaleY)
    //         .attr('y2', scaleY)
    //         .call(events)
    //     return svg
    // }
    // , possibilityWindowPoly = ({ pycx, pycxp, px, pxp }) => {
    //     const windowLeft = pycx * px
    //     const windowRight = windowLeft + pxp
    //     const windowBottom = pycxp * pxp
    //     const windowTop = windowBottom + px
    //     return [
    //           [ 0, 0 ]
    //         , [ 1, 0 ]
    //         , [ 1, 1 ]
    //         , [ 0, 1 ]
    //         , [ 0, 0 ]
    //         , [ windowLeft, windowBottom ]
    //         , [ windowRight, windowBottom ]
    //         , [ windowRight, windowTop ]
    //         , [ windowLeft, windowTop ]
    //         , [ windowLeft, windowBottom ]
    //         ]
    // }
    // , possibilityWindowPolyString = possibilityWindowPolygon =>
    //     possibilityWindowPolygon.map(([x, y]) =>
    //         `${scaleX(x)}, ${scaleY(y)}`
    //     ).join(' ')
    // , drawPossibilityWindow = svg => {
    //     const possibilityWindow = possibilityWindowPoly(model)
    //     svg.append('polygon')
    //         .attr('class', 'impossible')
    //         .attr('points', possibilityWindowPolyString(possibilityWindow))
    //         .attr('fill-rule', 'evenodd')
    //         .call(events)
    //     svg.append('rect')
    //         .attr('class', 'possible')
    //         .attr('x', scaleX(possibilityWindow[5][0]))
    //         .attr('y', scaleY(possibilityWindow[7][1]))
    //         .attr('width', scaleX(model.pxp) - plotLeft)
    //         .attr('height', plotBottom - scaleY(model.px))
    //         .call(events)
    //     return svg
    // }
    // , drawProbLocation = svg => {
    //     const filter = svg.append('defs')
    //         .append('filter')
    //         .attr('id', 'shadow')
    //     filter.append('feDropShadow')
    //         .attr('dx', 0)
    //         .attr('dy', 0)
    //         .attr('stdDeviation', 1)
    //     svg.append('circle')
    //         .attr('class', 'prob-location')
    //         .attr('cx', scaleX(model.pyxcs))
    //         .attr('cy', scaleY(model.pyxpcs))
    //         .attr('r', probLocationRadius)
    //         .style('filter', 'url(#shadow)')
    //         .classed('danger', !inPossibilityWindow(model))
    //         .call(events)
    //     return svg
    // }
    , inPossibilityWindow = pxy => pxpy => pyx => pyxp => px => pxp =>
        pxy <= pyx
            && pyx <= pxy + pxp
            && pxpy <= pyxp
            && pyxp <= pxpy + px
    , intervals = plotWidth
    , pixel = ctx => w => h => c => x => y => {
        ctx.fillStyle = c
        ctx.fillRect(x, y, w, h)
    }
    , scaleColor = d3.scaleQuantile().domain([false, true]).range(['red', 'blue'])//d3.scaleSequential(d3.interpolateRainbow)
    , scaleDiverging = d3.scaleDivergingSymlog(d3.interpolateBrBG).domain([-0.1, 0, 0.1])
    , color = cost => possible =>
        possible
            ? scaleDiverging(cost)
            : 'red'
    , parseRgb = color =>
        color.substring(4, color.length - 1).split(', ')
    , rgb = cost => possible => {
        // const cost2 = Math.pow(Math.abs(cost) / 2, 1/2)
        return possible
            ? parseRgb(scaleDiverging(cost)).map(n => parseInt(n))
            // ? [255 * (1 - cost2), cost > 0 ? (1 - cost2) * 255 : 255, cost < 0 ? (1 - cost2) * 255 : 255]
            : [162, 11, 11]
    }
    , pyx = ({pycxm, pycxmp, pm}) =>
        pycxm * pm + pycxmp * (1 - pm)
    , pyxp = ({pycxpm, pycxpmp, pm}) =>
        pycxpm * pm + pycxpmp * (1 - pm)
    , pyxcs = ({pycxm, pycxmp, pycxpm, pycxpmp, pm}) => pscm => pscmp => {
        const psm = pscm * pm
        const psmp = pscmp * (1 - pm)
        const ps = psm + psmp
        return [
              (pycxm * psm + pycxmp * psmp) / ps
            , (pycxpm * psm + pycxpmp * psmp) / ps
            ]
    }
    , cRDDiff = pyx => pyxp => pyxcs => pyxpcs =>
        pyx - pyxp - (pyxcs - pyxpcs)
    , cRRDiff = pyx => pyxp => pyxcs => pyxpcs =>
        pyx / pyxp - pyxcs / pyxpcs
    , cRRRatio = pyx => pyxp => pyxcs => pyxpcs =>
        pyx / pyxp / (pyxcs / pyxpcs)
    , possible = model => pscm => pscmp => {
        const pyx_ = pyx(model)
        const pyxp_ = pyxp(model)
        const [pyxcs_, pyxpcs_] = pyxcs(model)(pscm)(pscmp)
        const pxp = 1 - px
        const pxy = pyx_ * px
        const pxpy = pyxp_ * pxp
        return inPossibilityWindow(pxy)(pxpy)(pyxcs_)(pyxpcs_)(px)(pxp)
    }
    , updatePlot = canvas => model => {
        // const possibilityWindow = possibilityWindowPoly(model)
        // svg.select('polygon.impossible')
        //     .attr('points', possibilityWindowPolyString(possibilityWindow))
        //     .classed('danger', !inPossibilityWindow(model))
        // svg.select('rect.possible')
        //     .attr('x', scaleX(possibilityWindow[5][0]))
        //     .attr('y', scaleY(possibilityWindow[7][1]))
        //     .attr('width', scaleX(model.pxp) - plotLeft)
        //     .attr('height', plotBottom - scaleY(model.px))
        //     .classed('danger', !inPossibilityWindow(model))
        // svg.select('circle.prob-location')
        //     .attr('cx', scaleX(model.pyxcs))
        //     .attr('cy', scaleY(model.pyxpcs))
        //     .classed('danger', !inPossibilityWindow(model))
        const p = pixel(model.context)(intervals/plotWidth)(intervals/plotHeight)
            , poss = possible(model)
            , pyx_ = pyx(model)
            , pyxp_ = pyxp(model)
            , pyxcs_ = pyxcs(model)
        // let m = 0
        for (let x = 0; x < intervals; x++)
            for (let y = 0; y < intervals; y++) {
                const pscm = scaleX.invert(x + plotLeft)
                    , pscmp = scaleY.invert(y + plotTop)
                    , [pyxcs_2, pyxpcs_2] = pyxcs_(pscm)(pscmp)
                const cRD = cRDDiff(pyx_)(pyxp_)(pyxcs_2)(pyxpcs_2)
                    , dataLoc = y * (plotWidth * 4) + x * 4
                    , possible_ = poss(pscm)(pscmp)
                // const s = new Date()
                const colors = rgb(cRD)(possible_)
                // m += new Date() - s
                model.data[dataLoc] = colors[0]
                model.data[dataLoc + 1] = colors[1]
                model.data[dataLoc + 2] = colors[2]
                model.data[dataLoc + 3] = 255
            }
        // console.log(m)
        model.context.putImageData(model.imageData, 0, 0)
        // mapRange(intervals)(x =>
        //     mapRange(intervals)(y => {
        //         const pscm = scaleX.invert(x + plotLeft)
        //             , pscmp = scaleY.invert(y + plotTop)
        //             , [pyxcs_2, pyxpcs_2] = pyxcs_(pscm)(pscmp)
        //             , cRD = cRDDiff(pyx_)(pyxp_)(pyxcs_2)(pyxpcs_2)
        //         return p(color(cRD)(poss(pscm)(pscmp)))(x)(y)
        //     })
        // )
    }
    , move = () => {
        const pscm = scaleX.invert(d3.event.pageX - svgRect.x)
        const pscmp = scaleY.invert(d3.event.pageY - svgRect.y)
        const pyx_ = pyx(model)
        const pyxp_ = pyxp(model)
        const [pyxcs_, pyxpcs_] = pyxcs(model)(pscm)(pscmp)
        d3.select('#stats-window')
            .html(`P(s|m) = ${round2(pscm)}, P(s|m') = ${round2(pscmp)}<br>P(y<sub>x</sub>) = ${round2(pyx_)}, P(y<sub>x'</sub>) = ${round2(pyxp_)}<br>P(y<sub>x</sub>|s) = ${round2(pyxcs_)}, P(y<sub>x'</sub>|s) = ${round2(pyxpcs_)}<br>C<sub>RD<sub>YX</sub>,RD<sub>YX|S</sub></sub> = ${round2(cRDDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_))}<br>C<sub>RR<sub>YX</sub>,RR<sub>YX|S</sub></sub> = ${round2(cRRDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_))}`)
            .style('left', `${d3.event.pageX - 150}px`)
            .style('top', `${d3.event.pageY - 150}px`)
            .transition()
            .duration(100)
            .style('opacity', 1)
    }
    // , hover = () => {
    //     const yx = scaleX.invert(d3.event.pageX - svgRect.x)
    //     const yxp = scaleY.invert(d3.event.pageY - svgRect.y)
    //     d3.select('#stats-window')
    //         .html(`P(y<sub>x</sub>) = ${round2(yx)}<br>P(y<sub>x'</sub>) = ${round2(yxp)}`)
    //         .style('left', `${d3.event.pageX - 90}px`)
    //         .style('top', `${d3.event.pageY - 80}px`)
    //         .transition()
    //         .duration(100)
    //         .style('opacity', 1)
    // }
    , unhover = () =>
        d3.select('#stats-window')
            .transition()
            .style('opacity', 0)
    , events = selection =>
        selection
            .on('mouseover', move)//hover)
            .on('mousemove', move)
            .on('mouseout', unhover)
            .on('touchmove', move)
            .on('touchleave', unhover)
    , draw = compose
        ([ //drawProbLocation
         //, drawPossibilityWindow
         //, drawGridLines
         //, 
         drawAxes
         ])
    , updateProbabilities = model => {
        ({ px, pm, pycxm, pycxmp, pycxpm, pycxpmp } = model)
        model.pxp = 1 - px
        model.pmp = 1 - pm
        // model.pxy = pycx * px
        // model.pxpy = pycxp * model.pxp
        // model.py = model.pxy + model.pxpy
        // model.pyxcs = pmcs * pycxms + model.pmpcs * pycxmps
        // model.pyxpcs = pmcs * pycxpms + model.pmpcs * pycxpmps
        // pscmOutput.value = `P(s|m) = ${round2(pscm)}`
        // pscmpOutput.value = `P(s|m') = ${round2(pscmp)}`
        pxOutput.value = `P(x) = ${round2(px)} (P(x') = ${round2(model.pxp)})`
        pmOutput.value = `P(m) = ${round2(pm)} (P(m') = ${round2(model.pmp)})`
        pycxmOutput.value = `P(y|x, m) = ${round2(pycxm)}`
        pycxmpOutput.value = `P(y|x, m') = ${round2(pycxmp)}`
        pycxpmOutput.value = `P(y|x', m) = ${round2(pycxpm)}`
        pycxpmpOutput.value = `P(y|x', m') = ${round2(pycxpmp)}`
        // pxyOutput.value = `P(x, y) = ${round2(model.pxy)}, P(x, y') = ${round2(px - model.pxy)}, P(x', y) = ${round2(model.pxpy)}, P(x', y') = ${round2(model.pxp - model.pxpy)}`
        // pyOutput.value = `P(y) = ${round2(model.py)}`
        // pyxOutput.innerHTML = `P(y<sub>x</sub>|s) = ${round2(model.pyxcs)}, P(y<sub>x'</sub>|s) = ${round2(model.pyxpcs)}`
    }
    , updatePlotWithInputNumber = svg => model => e => {
        model[e.target.name] = e.target.valueAsNumber
        updateProbabilities(model)
        updatePlot(svg)(model)
    }
    , createPlot = svgElement => {
        updateProbabilities(model)
        const svg = draw(d3.select(svgElement))
        const canvas = d3.select('#plot')
        canvas.call(events)
        model.context = canvas.node().getContext('2d')
        model.imageData = model.context.getImageData(0, 0, plotWidth, plotHeight)
        model.data = model.imageData.data
    updatePlot(canvas)(model)
        Array.from(document.querySelectorAll('input[type=range]'))
            .map(range =>
                range.addEventListener('input', updatePlotWithInputNumber(svg)(model))
            )
    }
         

createPlot('svg')

const randomFrom = k =>
    (1 - k) * Math.random() + k

const randoms = n =>
    [...Array(n)].map(_ => Math.random())

const random8DimPoint = k => {
    const [px, pm, pycxm, pycxmp, pycxpm, pycxpmp] = randoms(6)
        , pscm = randomFrom(k)
        , pscmp = pscm - k
    return {px: 0, pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp}
}

const possiblePoint = k => {
    const point = random8DimPoint(k)
    return possible(point)(point.pscm)(point.pscmp)
        ? point
        : possiblePoint(k)
}

const probsArray = ({px, pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp}) =>
    [pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp, px]

const probsObject = ([pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp, px]) =>
    ({ px, pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp })

const c = k => ([pm, pycxm, pycxmp, pycxpm, pycxpmp, pscm]) => {
    const point = { pm, pycxm, pycxmp, pycxpm, pycxpmp }
        , pyx_ = pyx(point)
        , pyxp_ = pyxp(point)
        , [pyxcs_, pyxpcs_] = pyxcs(point)(pscm)(pscm - k)
    return cRDDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_)
}

const alpha = 0.0001
    , alpha2 = 0.000001
    , gradientDelta = 0.000001
    , epsilon = 0.000001

// const gradientC = point1 => point2 =>
//     (c(point1) - c(point2)) / gradientDelta

const increasePoint = increase => point => pos =>
    point.map((x, i) => i == pos
        ? Math.min(x + increase, 1)
        : x
    )

const gradients = f => fPoint => point =>
    mapRange(6)(i => {
        const pointPlusH = increasePoint(gradientDelta)(point)(i)
            , h = pointPlusH[i] - point[i]
        return h == 0
            ? 0
            : (f(pointPlusH) - fPoint) / h
    })

const ascendPoint = k => increase => point => pos =>
    point.map((x, i) => i == pos
        ? clamp(i == 5 ? k : 0)(1)(x + increase)
        : x
    )

const tryAscendPoint = k => grads => acc => pos => {
    const ascended = ascendPoint(k)(grads[pos] * alpha)(acc)(pos)
    if (possible(probsObject(ascended))(ascended[5])(ascended[5] - k))
        return ascended
    else {
        const ascended2 = ascendPoint(k)(grads[pos] * alpha2)(acc)(pos)
        return possible(probsObject(ascended2))(ascended2[5])(ascended2[5] - k)
            ? ascended2
            : acc
    }
}

const ascend = grads => point => k =>
    foldRange(tryAscendPoint(k)(grads))(point)(6)

const changed = point1 => point2 =>
    point1.find((x, i) => Math.abs(point2[i] - x) > epsilon)

const ascendUntilNoChange = pointObject => k => {
    let previousPoint = [0.5, 0, 1, 1, 0, clamp(0)(1)(0.4 + k), 0, 0.5]//probsArray(pointObject)
        , cOfPoint = c(k)(previousPoint)
        , grads = gradients(c(k))(cOfPoint)(previousPoint)
        , nextPoint = ascend(grads)(previousPoint)(k)
    while (changed(previousPoint)(nextPoint)) {
        previousPoint = nextPoint
        cOfPoint = c(k)(previousPoint)
        grads = gradients(c(k))(cOfPoint)(previousPoint)
        nextPoint = ascend(grads)(previousPoint)(k)
    }
    return {cOfPoint, point: nextPoint}
}

mapRangeStep(101)(0.01)(k => {
    const ascended = ascendUntilNoChange(possiblePoint(k))(k)
    console.log(`c_max(${k}):`, ascended)
})