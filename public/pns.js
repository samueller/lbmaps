const width = (height = 575),
  marginLeft = (marginBottom = 50),
  marginTop = (marginRight = 25),
  svg = document.getElementById('plot'),
  title = document.getElementById('plot-title'),
  titles = [
    [
      'Lower Bounds on the Probability of Benefit',
      'Upper Bounds on the Probability of Benefit',
    ],
    [
      'Lower Bounds on the Probability of Harm',
      'Upper Bounds on the Probability of Harm',
    ],
  ],
  infoLowerBounds = document.getElementById('info-lower-bounds'),
  infoUpperBounds = document.getElementById('info-upper-bounds'),
  info = [
    [
      'Minimum probability of benefiting from treatment X',
      'Maximum probability of benefiting from treatment X',
    ],
    [
      'Minimum probability of treatment X causing harm',
      'Maximum probability of treatment X causing harm',
    ],
  ],
  plotLeft = marginLeft,
  plotRight = width - marginRight,
  plotTop = marginTop,
  plotBottom = height - marginBottom,
  plotWidth = plotRight - plotLeft,
  plotHeight = plotBottom - plotTop,
  scaleX = d3.scaleLinear().range([plotLeft, plotRight]).domain([0, 1]),
  scaleY = d3.scaleLinear().range([plotBottom, plotTop]).domain([0, 1]),
  leftEdge = scaleX(0),
  rightEdge = scaleX(1),
  bottomEdge = scaleY(0),
  topEdge = scaleY(1),
  axisLeft = d3.axisLeft(scaleY),
  axisRight = d3.axisRight(scaleY),
  axisTop = d3.axisTop(scaleX),
  axisBottom = d3.axisBottom(scaleX),
  numContours = 10,
  obsDataCheckbox = document.getElementById('obs-data'),
  hoverPopupCheckbox = document.getElementById('hover-popup'),
  pxSlider = document.getElementById('px-slider'),
  pycxSlider = document.getElementById('pycx-slider'),
  pycxpSlider = document.getElementById('pycxp-slider'),
  pyxSlider = document.getElementById('pyx-slider'),
  pyxpSlider = document.getElementById('pyxp-slider'),
  pxOutput = document.getElementById('px-val'),
  pxpOutput = document.getElementById('pxp-val'),
  pycxOutput = document.getElementById('pycx-val'),
  pycxpOutput = document.getElementById('pycxp-val'),
  pyOutput = document.getElementById('py-val'),
  pxyOutput = document.getElementById('pxy-val'),
  pxypOutput = document.getElementById('pxyp-val'),
  pxpyOutput = document.getElementById('pxpy-val'),
  pxpypOutput = document.getElementById('pxpyp-val'),
  pyxOutput = document.getElementById('pyx-val'),
  pyxpOutput = document.getElementById('pyxp-val'),
  initialModel =
    boundsOf =>
    bounds =>
    obsData =>
    hoverPopup =>
    px =>
    pycx =>
    pycxp =>
    pyx =>
    pyxp => {
      const pxp = 1 - px,
        pxy = px * pycx,
        pxyp = px * (1 - pycx),
        pxpy = pxp * pycxp,
        pxpyp = pxp * (1 - pycxp),
        py = pxy + pxpy
      return {
        boundsOf,
        bounds,
        obsData,
        hoverPopup,
        px,
        pycx,
        pycxp,
        pxp,
        pxy,
        pxyp,
        pxpy,
        pxpyp,
        py,
        pyx,
        pyxp,
      }
    },
  boundsOfFromUrl = () =>
    new URL(window.location).searchParams.get('bounds-of') == 'harm' ? 1 : 0,
  boundsFromUrl = () =>
    new URL(window.location).searchParams.get('bounds') == 'upper' ? 1 : 0,
  model = initialModel(boundsOfFromUrl())(boundsFromUrl())(
    obsDataCheckbox.checked
  )(hoverPopupCheckbox.checked)(+pxSlider.value)(+pycxSlider.value)(
    +pycxpSlider.value
  )(+pycxSlider.value)(pyxpSlider.value),
  textWithSub = pre => sub => post => textNode => {
    textNode.text(pre)
    textNode.append('tspan').attr('class', 'sub').attr('dy', '0.3em').text(sub)
    textNode.append('tspan').attr('dy', '-0.21em').text(post)
  },
  drawBackground = svg => {
    svg
      .append('rect')
      .attr('class', 'background')
      .attr('x', scaleX(0))
      .attr('y', scaleY(1))
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
    return svg
  },
  drawAxes = svg => {
    svg
      .append('g')
      .attr('class', 'x-axis bottom')
      .attr('transform', `translate(${[0, plotBottom]})`)
      .call(axisBottom)
    svg
      .append('g')
      .attr('class', 'x-axis top')
      .attr('transform', `translate(${[0, plotTop]})`)
      .call(axisTop)
    svg
      .append('g')
      .attr('class', 'y-axis left')
      .attr('transform', `translate(${[plotLeft, 0]})`)
      .call(axisLeft)
    svg
      .append('g')
      .attr('class', 'y-axis right')
      .attr('transform', `translate(${[plotRight, 0]})`)
      .call(axisRight)
    svg
      .append('text')
      .attr('class', 'axis-label')
      .call(textWithSub('P(y')('x')(')'))
      .attr(
        'transform',
        `translate(${[plotLeft + plotWidth / 2, plotBottom + 40]})`
      )
    svg
      .append('text')
      .attr('class', 'axis-label')
      .call(textWithSub('P(y')("x'")(')'))
      .attr(
        'transform',
        `translate(${[plotLeft - 40, plotTop + plotHeight / 2]}) rotate(-90)`
      )
    return svg
  },
  drawGridLines = svg => {
    svg
      .selectAll('line.grid.x')
      .data(d3.range(0.1, 1, 0.1))
      .join('line')
      .attr('class', 'grid x')
      .attr('x1', scaleX)
      .attr('x2', scaleX)
      .attr('y1', bottomEdge)
      .attr('y2', topEdge)
    svg
      .selectAll('line.grid.y')
      .data(d3.range(0.1, 1, 0.1))
      .join('line')
      .attr('class', 'grid y')
      .attr('x1', leftEdge)
      .attr('x2', rightEdge)
      .attr('y1', scaleY)
      .attr('y2', scaleY)
    return svg
  },
  contoursCoordsBenefitLB = d => [
    [(d + 1) / numContours, 0],
    [d / numContours, 0],
    [d / numContours, 0],
    // , [ (1 + d/numContours)/2, (1 - d/numContours)/2 ]
    // , [ (1 + d/numContours)/2, (1 - d/numContours)/2 ]
    [1, 1 - d / numContours],
    [1, 1 - d / numContours],
    [1, 1 - (d + 1) / numContours],
    [1, 1 - (d + 1) / numContours],
    // , [ (1 + (d+1)/numContours)/2, (1 - (d+1)/numContours)/2 ]
    // , [ (1 + (d+1)/numContours)/2, (1 - (d+1)/numContours)/2 ]
    [(d + 1) / numContours, 0],
    [(d + 1) / numContours, 0],
  ],
  contoursCoordsBenefitUB = d => [
    [(d + 1) / numContours, 0],
    [d / numContours, 0],
    [d / numContours, 1 - d / numContours],
    [d / numContours, 1 - d / numContours],
    [1, 1 - d / numContours],
    [1, 1 - (d + 1) / numContours],
    [(d + 1) / numContours, 1 - (d + 1) / numContours],
    [(d + 1) / numContours, 1 - (d + 1) / numContours],
    [(d + 1) / numContours, 0],
  ],
  contoursCoordsHarmLB = d => [
    [0, (d + 1) / numContours],
    [0, d / numContours],
    [0, d / numContours],
    [1 - d / numContours, 1],
    [1 - d / numContours, 1],
    [1 - (d + 1) / numContours, 1],
    [1 - (d + 1) / numContours, 1],
    [0, (d + 1) / numContours],
    [0, (d + 1) / numContours],
  ],
  contoursCoordsHarmUB = d => [
    [0, (d + 1) / numContours],
    [0, d / numContours],
    [1 - d / numContours, d / numContours],
    [1 - d / numContours, d / numContours],
    [1 - d / numContours, 1],
    [1 - (d + 1) / numContours, 1],
    [1 - (d + 1) / numContours, (d + 1) / numContours],
    [1 - (d + 1) / numContours, (d + 1) / numContours],
    [0, (d + 1) / numContours],
  ],
  middleLeftContourCoord = py => x => x < 0 ? [0, py - x] : [x, py],
  middleTopContourCoord = py => y => y > 1 ? [py - y + 1, 1] : [py, y],
  middleBottomContourCoord = py => y => y < 0 ? [py - y, 0] : [py, y],
  middleRightContourCoord = py => x => x > 1 ? [1, py - x + 1] : [x, py],
  contoursCoordsBenefitLBObs = py => d =>
    [
      [0, Math.max(0, py - (d + 1) / 10)],
      [0, Math.max(0, py - d / 10)],
      middleBottomContourCoord(py)(py - d / 10),
      middleRightContourCoord(py)(py + d / 10),
      [Math.min(1, py + d / 10), 1],
      [Math.min(1, py + (d + 1) / 10), 1],
      middleRightContourCoord(py)(py + (d + 1) / 10),
      middleBottomContourCoord(py)(py - (d + 1) / 10),
      [0, Math.max(0, py - (d + 1) / 10)],
    ],
  contoursCoordsBenefitUBObs = y => d =>
    1 - y < d / numContours
      ? [
          [(d + 1) / 10, 0],
          [d / 10, 0],
          [1, 0],
          [1, 0],
          [1, 1 - d / 10],
          [1, 1 - (d + 1) / 10],
          [1, 0],
          [1, 0],
          [(d + 1) / 10, 0],
        ]
      : [
          [(d + 1) / 10, 0],
          [d / 10, 0],
          [d / 10, y],
          [1 - y, 1 - d / 10],
          [1, 1 - d / 10],
          [1, 1 - (d + 1) / 10],
          1 - y < (d + 1) / 10 ? [1, 0] : [1 - y, 1 - (d + 1) / 10],
          1 - y < (d + 1) / 10 ? [1, 0] : [(d + 1) / 10, y],
          [(d + 1) / 10, 0],
        ],
  contoursCoordsHarmLBObs = py => d =>
    [
      [Math.max(0, py - (d + 1) / 10), 0],
      [Math.max(0, py - d / 10), 0],
      middleLeftContourCoord(py)(py - d / 10),
      middleTopContourCoord(py)(py + d / 10),
      [1, Math.min(1, py + d / 10)],
      [1, Math.min(1, py + (d + 1) / 10)],
      middleTopContourCoord(py)(py + (d + 1) / 10),
      middleLeftContourCoord(py)(py - (d + 1) / 10),
      [Math.max(0, py - (d + 1) / 10), 0],
    ],
  contoursCoordsHarmUBObs = y => d =>
    1 - y < d / numContours
      ? [
          [0, (d + 1) / 10],
          [0, d / 10],
          [0, 1],
          [0, 1],
          [1 - d / 10, 1],
          [1 - (d + 1) / 10, 1],
          [0, 1],
          [0, 1],
          [0, (d + 1) / 10],
        ]
      : [
          [0, (d + 1) / 10],
          [0, d / 10],
          [y, d / 10],
          [1 - d / 10, 1 - y],
          [1 - d / 10, 1],
          [1 - (d + 1) / 10, 1],
          1 - y < (d + 1) / 10 ? [0, 1] : [1 - (d + 1) / 10, 1 - y],
          1 - y < (d + 1) / 10 ? [0, 1] : [y, (d + 1) / 10],
          [0, (d + 1) / 10],
        ],
  contours =
    ({ obsData, boundsOf, bounds, pxy, pxyp, pxpy, pxpyp, py }) =>
    d =>
      svgStringFromCoords(
        obsData
          ? boundsOf == 0
            ? bounds == 0
              ? contoursCoordsBenefitLBObs(py)(d)
              : contoursCoordsBenefitUBObs(pxyp + pxpy)(d)
            : bounds == 0
            ? contoursCoordsHarmLBObs(py)(d)
            : contoursCoordsHarmUBObs(pxy + pxpyp)(d)
          : boundsOf == 0
          ? bounds == 0
            ? contoursCoordsBenefitLB(d)
            : contoursCoordsBenefitUB(d)
          : bounds == 0
          ? contoursCoordsHarmLB(d)
          : contoursCoordsHarmUB(d)
      ),
  drawContours = svg => {
    svg
      .selectAll('polygon.contour')
      .data(d3.range(numContours))
      .join('polygon')
      .attr('class', 'contour')
      .attr('fill', d => d3.schemeSpectral[numContours][d])
      .attr('points', contours(model))
    svg
      .selectAll('text.contour')
      .data(d3.range(numContours))
      .join('text')
      .attr('class', 'contour')
      .attr('opacity', 0)
      .attr('fill', d => (d == 0 || d == 8 || d == 9 ? 'white' : 'black'))
      .text(
        d => `${round2(d / numContours)} to ${round2((d + 1) / numContours)}`
      )
    return svg
  },
  possibilityWindowPoly = ({ pycx, pycxp, px, pxp }) => {
    const windowLeft = pycx * px
    const windowRight = windowLeft + pxp
    const windowBottom = pycxp * pxp
    const windowTop = windowBottom + px
    return [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
      [windowLeft, windowBottom],
      [windowRight, windowBottom],
      [windowRight, windowTop],
      [windowLeft, windowTop],
      [windowLeft, windowBottom],
    ]
  },
  svgStringFromCoords = polygon =>
    polygon.map(([x, y]) => `${scaleX(x)},${scaleY(y)}`).join(' '),
  drawPossibilityWindow = svg => {
    const possibilityWindow = possibilityWindowPoly(model)
    svg
      .append('polygon')
      .attr('class', 'impossible')
      .attr('points', svgStringFromCoords(possibilityWindow))
      .attr('fill-rule', 'evenodd')
    svg
      .append('rect')
      .attr('class', 'possible')
      .attr('x', scaleX(possibilityWindow[5][0]))
      .attr('y', scaleY(possibilityWindow[7][1]))
      .attr('width', scaleX(model.pxp) - plotLeft)
      .attr('height', plotBottom - scaleY(model.px))
    svg
      .append('line')
      .attr('class', 'possible-label')
      .attr(
        'x1',
        scaleX(possibilityWindow[5][0] / 4 + (possibilityWindow[6][0] * 3) / 4)
      )
      .attr('y1', scaleY(possibilityWindow[6][1] - 0.075))
      .attr(
        'x2',
        scaleX(possibilityWindow[5][0] / 3 + (possibilityWindow[6][0] * 2) / 3)
      )
      .attr('y2', scaleY(possibilityWindow[6][1]))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')
      .attr('opacity', 0.75)
    svg
      .append('text')
      .attr('class', 'possible-label')
      .text('Possible region')
      .attr(
        'transform',
        `translate(${[
          scaleX(
            possibilityWindow[5][0] / 4 + (possibilityWindow[6][0] * 3) / 4
          ),
          scaleY(possibilityWindow[6][1] - 0.1),
        ]})`
      )
    return svg
  },
  drawDiagonal = svg => {
    svg
      .append('line')
      .attr('class', 'diagonal')
      .attr('x1', scaleX(0))
      .attr('y1', scaleY(0))
      .attr('x2', scaleX(1))
      .attr('y2', scaleY(1))
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '3 6')
      .attr('opacity', 0.75)
    return svg
  },
  inPossibilityWindow =
    ({ px, pxp, pxy, pxpy }) =>
    pyx =>
    pyxp =>
      pxy <= pyx && pyx <= pxy + pxp && pxpy <= pyxp && pyxp <= pxpy + px,
  lowerBoundBenefit =
    ({ py }) =>
    pyx =>
    pyxp =>
      Math.max(0, pyx - pyxp, py - pyxp, pyx - py),
  upperBoundBenefit =
    ({ pxy, pxyp, pxpy, pxpyp }) =>
    pyx =>
    pyxp =>
      // outside of possibility window, this could be negative
      Math.max(
        0,
        Math.min(pyx, 1 - pyxp, pxy + pxpyp, pyx - pyxp + pxpy + pxyp)
      ),
  lowerBoundHarm =
    ({ py }) =>
    pyx =>
    pyxp =>
      Math.max(0, pyxp - pyx, pyxp - py, py - pyx),
  upperBoundHarm =
    ({ pxy, pxyp, pxpy, pxpyp }) =>
    pyx =>
    pyxp =>
      // outside of possibility window, this could be negative
      Math.max(
        0,
        Math.min(pyxp, 1 - pyx, pxyp + pxpy, pyxp - pyx + pxy + pxpyp)
      ),
  // , colorRange = d3.scaleQuantize().range(d3.schemeSpectral[10])
  contourTextOpacity = model => d =>
    model.obsData
      ? model.boundsOf == 0
        ? model.bounds == 0
          ? model.py < (d + 0.75) / numContours
            ? 0
            : 0.9
          : 1 - model.pxyp - model.pxpy < d / numContours
          ? 0
          : 0.9
        : model.bounds == 0
        ? model.py < (d + 0.75) / numContours
          ? 0
          : 0.9
        : 1 - model.pxy - model.pxpyp < d / numContours
        ? 0
        : 0.9
      : model.bounds == 0 && d / numContours >= 0.9
      ? 0
      : 0.9,
  contourTextTransform = model => d =>
    model.obsData || model.bounds == 1
      ? model.boundsOf == 0
        ? model.bounds == 0
          ? `translate(${[
              scaleX(0.01),
              scaleY(model.py - (d + 0.5) / numContours),
            ]}) rotate(0)`
          : `translate(${[
              scaleX((d + 0.5) / numContours),
              scaleY(0.01),
            ]}) rotate(-90)`
        : model.bounds == 0
        ? `translate(${[
            scaleX(model.py - (d + 0.5) / numContours),
            scaleY(0.01),
          ]}) rotate(-90)`
        : `translate(${[
            scaleX(0.01),
            scaleY((d + 0.5) / numContours),
          ]}) rotate(0)`
      : model.boundsOf == 0
      ? `translate(${[
          scaleX((d + 0.575) / numContours),
          scaleY(0.01),
        ]}) rotate(-45)`
      : `translate(${[
          scaleX(0.01),
          scaleY((d + 0.575) / numContours),
        ]}) rotate(-45)`,
  updatePlot = svg => model => {
    if (model.obsData) {
      const possibilityWindow = possibilityWindowPoly(model)
      svg
        .select('polygon.impossible')
        .attr('points', svgStringFromCoords(possibilityWindow))
        .transition()
        .duration(1000)
        .attr('opacity', 1)
      svg
        .select('rect.possible')
        .attr('x', scaleX(possibilityWindow[5][0]))
        .attr('y', scaleY(possibilityWindow[7][1]))
        .attr('width', scaleX(model.pxp) - plotLeft)
        .attr('height', plotBottom - scaleY(model.px))
        .transition()
        .duration(1000)
        .attr('opacity', 1)
      svg
        .select('line.possible-label')
        .attr(
          'x1',
          scaleX(
            possibilityWindow[5][0] / 4 + (possibilityWindow[6][0] * 3) / 4
          )
        )
        .attr('y1', scaleY(possibilityWindow[6][1] - 0.075))
        .attr(
          'x2',
          scaleX(
            possibilityWindow[5][0] / 3 + (possibilityWindow[6][0] * 2) / 3
          )
        )
        .attr('y2', scaleY(possibilityWindow[6][1]))
        .transition()
        .duration(1000)
        .attr('opacity', 1)
      svg
        .select('text.possible-label')
        .attr(
          'transform',
          `translate(${[
            scaleX(
              possibilityWindow[5][0] / 4 + (possibilityWindow[6][0] * 3) / 4
            ),
            scaleY(possibilityWindow[6][1] - 0.075),
          ]})`
        )
        .transition()
        .duration(1000)
        .attr('opacity', 1)
    } else {
      svg
        .select('polygon.impossible')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
      svg.select('rect.possible').transition().duration(1000).attr('opacity', 0)
      svg
        .select('line.possible-label')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
      svg
        .select('text.possible-label')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
    }
    svg
      .selectAll('polygon.contour')
      .join('polygon')
      .transition()
      .duration(1000)
      .attr('points', contours(model))
    svg
      .selectAll('text.contour')
      .join('text')
      .transition()
      .duration(1000)
      .attr('opacity', contourTextOpacity(model))
      .attr('transform', contourTextTransform(model))
    // const r = 100
    // svg.selectAll('rect.test')
    //     .data(d3.range(0, r*r))
    //     .join('rect')
    //     .attr('class', 'test')
    //     .attr('x', d => scaleX((d%r)/r))
    //     .attr('y', d => scaleY((Math.floor(d/r)+1)/r))
    //     .attr('width', 500/r)
    //     .attr('height', 500/r)
    //     .attr('fill', d => {
    //         const range = upperBound(model)((d%r)/r)(Math.floor(d/r)/r) - lowerBound(model)((d%r)/r)(Math.floor(d/r)/r)
    //         return range < 0 ? 'none' : colorRange(range)
    //     })
  },
  lowerBound = model => pyx => pyxp =>
    model.obsData
      ? model.boundsOf == 0
        ? lowerBoundBenefit(model)(pyx)(pyxp)
        : lowerBoundHarm(model)(pyx)(pyxp)
      : model.boundsOf == 0
      ? Math.max(0, pyx - pyxp)
      : Math.max(0, pyxp - pyx),
  upperBound = model => pyx => pyxp =>
    model.obsData
      ? model.boundsOf == 0
        ? upperBoundBenefit(model)(pyx)(pyxp)
        : upperBoundHarm(model)(pyx)(pyxp)
      : model.boundsOf == 0
      ? Math.min(pyx, 1 - pyxp)
      : Math.min(pyxp, 1 - pyx),
  move = () => {
    if (!model.hoverPopup) return
    const [x, y] = d3.mouse(svg),
      pyx = scaleX.invert(x),
      pyxp = scaleY.invert(y),
      lowerBound_ = lowerBound(model)(pyx)(pyxp),
      upperBound_ = upperBound(model)(pyx)(pyxp),
      impossible = model.obsData && !inPossibilityWindow(model)(pyx)(pyxp)
    if (pyx >= 0 && pyx <= 1 && pyxp >= 0 && pyxp <= 1) {
      d3.select('#stats-window')
        // .html(`P(y<sub>x</sub>) = ${round2(pyx)}, P(y<sub>x'</sub>) = ${round2(pyxp)}<br>${round2(lowerBound_)} &le; P(y<sub>x</sub> &gt; y'<sub>x'</sub>) &le; ${round2(upperBound_)}<br>Probability range: ${round2(upperBound_ - lowerBound_)}`)
        // .html(`${!poss ? '<h3 class="title is-4">Impossible Area</h3>' : ''}${renderProbability(pyx)}, ${round2(pyxp)})<br>Probability of benefiting &ge; ${round2(lowerBound_)}<br>Probability of benefiting &le; ${round2(upperBound_)}<br>Probability range: ${round2(upperBound_ - lowerBound_)}`)
        .classed('impossible', impossible)
        .style('left', `${x - 125}px`)
        .style('top', `${y - 45}px`)
        .style('background-color', _ =>
          pyxp > 0.75 ? `rgba(255, 255, 255, ${2.4 * pyxp - 1.4})` : null
        )
        .style('border', _ => (pyxp > 0.9 ? '1px solid black' : null))
        .transition()
        .duration(100)
        .style('opacity', 1)
      renderMath(document.getElementById('stats-pyx'))(
        `(${round2(pyx)}, ${round2(pyxp)})`
      )
      renderMath(document.getElementById('stats-bounds'))(
        `${round2(lowerBound_)} \\leqslant P(y_x ${
          model.boundsOf == 0 ? '>' : '<'
        } y_{x'}) \\leqslant ${round2(upperBound_)}`
      )
      renderMath(document.getElementById('stats-range'))(
        `${round2(upperBound_ - lowerBound_)}`
      )
    }
  },
  unhover = () => d3.select('#stats-window').transition().style('opacity', 0),
  events = selection =>
    selection
      .on('mouseover', move)
      .on('mousemove', move)
      .on('mouseout', unhover)
      .on('touchmove', move)
      .on('touchleave', unhover),
  draw = compose([
    drawPossibilityWindow,
    drawDiagonal,
    drawContours,
    drawGridLines,
    drawAxes,
    drawBackground,
  ]),
  noThrowOnError = { throwOnError: false },
  renderMath = element => math => katex.render(math, element, noThrowOnError),
  renderProbability = element => param => val =>
    renderMath(element)(`P(${param}) = ${round2(val)}`),
  updateProbabilities = model => {
    const { px, pycx, pycxp } = model
    model.pxp = 1 - px
    model.pxy = pycx * px
    model.pxyp = (1 - pycx) * px
    model.pxpy = pycxp * model.pxp
    model.pxpyp = (1 - pycxp) * model.pxp
    model.py = model.pxy + model.pxpy
    try {
      renderProbability(pxOutput)('x')(px)
      renderProbability(pxpOutput)("x'")(model.pxp)
      renderProbability(pycxOutput)('y|x')(pycx)
      renderProbability(pycxpOutput)("y|x'")(pycxp)
      renderProbability(pxyOutput)('x, y')(model.pxy)
      renderProbability(pxypOutput)("x, y'")(model.pxyp)
      renderProbability(pxpyOutput)("x', y")(model.pxpy)
      renderProbability(pxpypOutput)("x', y'")(model.pxpyp)
      renderProbability(pyOutput)('y')(model.py)
      renderProbability(pyxOutput)('y_x')(model.pyx)
      renderProbability(pyxpOutput)("y_{x'}")(model.pyxp)
    } catch {
      console.error('Katex not loaded yet')
    }
  },
  updateBenefitHarmText = model => {
    const lowerBound_ = lowerBound(model)(model.pyx)(model.pyxp),
      upperBound_ = upperBound(model)(model.pyx)(model.pyxp),
      impossible =
        model.obsData && !inPossibilityWindow(model)(model.pyx)(model.pyxp)
    d3.select('#pns-output').classed('impossible', impossible)
    renderMath(document.getElementById('text-bounds'))(
      `${round2(lowerBound_)} \\leqslant P(y_x ${
        model.boundsOf == 0 ? '>' : '<'
      } y_{x'}) \\leqslant ${round2(upperBound_)}`
    )
    renderMath(document.getElementById('text-range'))(
      `${round2(upperBound_ - lowerBound_)}`
    )
  },
  updatePlotWithInputNumber = svg => model => e => {
    model[e.target.name] = e.target.valueAsNumber
    updateProbabilities(model)
    updatePlot(svg)(model)
    updateBenefitHarmText(model)
  },
  setBoundsLabel = boundsOf =>
    typeof katex == 'undefined'
      ? (document.getElementById('bounds-label').innerHTML = 'Bounds')
      : renderMath(document.getElementById('bounds-label'))(
          boundsOf == 0 ? "P(y_x > y_{x'})" : "P(y_x < y_{x'})"
        ),
  setBoundsOfInput = boundsOf => {
    document.querySelector(
      `input[name=bounds-of][value="${boundsOf}"]`
    ).checked = true
    if (model.boundsOf != 0) setBoundsLabel(boundsOf)
  },
  setBoundsInput = bounds =>
    (document.querySelector(
      `input[name=bounds][value="${bounds}"]`
    ).checked = true),
  disallowObsDataInput = () => {
    Array.from(
      document.querySelectorAll('#obs-data-controls input[type=range]')
    ).map(el => el.setAttribute('disabled', ''))
    d3.select('#obs-data-controls')
      .transition()
      .duration(600)
      .style('opacity', 0.5)
  },
  allowObsDataInput = () => {
    Array.from(document.querySelectorAll('input[type=range]')).map(el =>
      el.removeAttribute('disabled')
    )
    d3.select('#obs-data-controls')
      .transition()
      .duration(600)
      .style('opacity', 1)
  },
  setObsDataInput = enabled =>
    enabled ? allowObsDataInput() : disallowObsDataInput(),
  createPlot = svgElement => {
    const svg = draw(d3.select(svgElement))
    svg.call(events)
    setBoundsOfInput(boundsOfFromUrl())
    setBoundsInput(boundsFromUrl())
    setObsDataInput(obsDataCheckbox.checked)
    updatePlot(svg)(model)
    obsDataCheckbox.addEventListener('input', e => {
      setObsDataInput((model.obsData = e.target.checked))
      updatePlot(svg)(model)
    })
    hoverPopupCheckbox.addEventListener(
      'input',
      e => (model.hoverPopup = e.target.checked)
    )
    Array.from(document.querySelectorAll('input[type=range]')).map(el =>
      el.addEventListener('input', updatePlotWithInputNumber(svg)(model))
    )
    Array.from(document.querySelectorAll('input[name=bounds-of]')).map(el =>
      el.addEventListener('input', e => {
        model.boundsOf = parseInt(e.target.value)
        title.innerHTML = titles[model.boundsOf][model.bounds]
        infoLowerBounds.setAttribute('aria-label', info[model.boundsOf][0])
        infoUpperBounds.setAttribute('aria-label', info[model.boundsOf][1])
        setBoundsLabel(model.boundsOf)
        updatePlot(svg)(model)
      })
    )
    Array.from(document.querySelectorAll('input[name=bounds]')).map(el =>
      el.addEventListener('input', e => {
        model.bounds = parseInt(e.target.value)
        title.innerHTML = titles[model.boundsOf][model.bounds]
        updatePlot(svg)(model)
      })
    )
  }

createPlot('#plot')
