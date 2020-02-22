const width = height = 575
    , marginLeft = marginBottom = 50
    , marginTop = marginRight = 25
    , svg = document.getElementById('plot')
    , plotLeft = marginLeft
    , plotRight = width - marginRight
    , plotTop = marginTop
    , plotBottom = height - marginBottom
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
    , pxSlider = document.getElementById('px-slider')
    , pycxSlider = document.getElementById('pycx-slider')
    , pycxpSlider = document.getElementById('pycxp-slider')
    , pxOutput = document.getElementById('px-val')
    , pxpOutput = document.getElementById('pxp-val')
    , pycxOutput = document.getElementById('pycx-val')
    , pycxpOutput = document.getElementById('pycxp-val')
    , pyOutput = document.getElementById('py-val')
    , pxyOutput = document.getElementById('pxy-val')
    , pxypOutput = document.getElementById('pxyp-val')
    , pxpyOutput = document.getElementById('pxpy-val')
    , pxpypOutput = document.getElementById('pxpyp-val')
    , initialModel = px => pycx => pycxp => {
        const pxp = 1 - px
            , pxy = px * pycx
            , pxyp = px * (1 - pycx)
            , pxpy = pxp * pycxp
            , pxpyp = pxp * (1 - pycxp)
            , py = pxy + pxpy
        return { px, pycx, pycxp, pxp, pxy, pxyp, pxpy, pxpyp, py }
    }
    , model = initialModel(+pxSlider.value)(+pycxSlider.value)(+pycxpSlider.value)
    , textWithSub = pre => sub => post => textNode => {
        textNode.text(pre)
        textNode.append('tspan').attr('class', 'sub').attr('dy', '0.3em').text(sub)
        textNode.append('tspan').attr('dy', '-0.21em').text(post)
    }
    , drawBackground = svg => {
        svg.append('rect')
            .attr('class', 'background')
            .attr('x', scaleX(0))
            .attr('y', scaleY(1))
            .attr('width', width - marginLeft - marginRight)
            .attr('height', height - marginTop - marginBottom)
        return svg
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
            // .call(textWithSub('P(y')('x')(')'))
            .text('Experimental success rate with treatment')
            .attr('transform', `translate(${[plotLeft + plotWidth/2, plotBottom + 40]})`)
        svg.append('text')
            .attr('class', 'axis-label')
            // .call(textWithSub('P(y')('x\'')(')'))
            .text('Experimental success rate without treatment')
            .attr('transform', `translate(${[plotLeft - 40, plotTop + plotHeight/2]}) rotate(-90)`)
        return svg
    }
    , drawGridLines = svg => {
        svg.selectAll('line.grid.x')
            .data(d3.range(0.1, 1, 0.1))
            .join('line')
            .attr('class', 'grid x')
            .attr('x1', scaleX)
            .attr('x2', scaleX)
            .attr('y1', bottomEdge)
            .attr('y2', topEdge)
        svg.selectAll('line.grid.y')
            .data(d3.range(0.1, 1, 0.1))
            .join('line')
            .attr('class', 'grid y')
            .attr('x1', leftEdge)
            .attr('x2', rightEdge)
            .attr('y1', scaleY)
            .attr('y2', scaleY)
        return svg
    }
    , middleBottomContourCoord = py => y =>
        y < 0
            ? [ py - y, 0 ]
            : [ py, y ]
    , middleRightContourCoord = py => x =>
        x > 1
            ? [ 1, py + x - 1 ]
            : [ x, py ]
    , contours = ({ py }) => d =>
        svgStringFromCoords(
            [ [ 0, Math.max(0, d/10 + py - 1) ]
            , [ 0, Math.max(0, (d+1)/10 + py - 1) ]
            // , [ py, Math.max(0, (d+1)/10 + py - 1) ]
            , middleBottomContourCoord(py)((d+1)/10 + py - 1)
            // , [ Math.min(1, py + (9-d)/10), py ]
            , middleRightContourCoord(py)((9-d)/10 + py)
            , [ Math.min(1, py + (9-d)/10), 1 ]
            , [ Math.min(1, py + (10-d)/10), 1 ]
            // , [ Math.min(1, py + (10-d)/10), py ]
            , middleRightContourCoord(py)((10-d)/10 + py)
            // , [ py, Math.max(0, d/10 + py - 1) ]
            , middleBottomContourCoord(py)(d/10 + py - 1)
            , [ 0, Math.max(0, d/10 + py - 1) ]
            ]
        )
    , drawContours = svg => {
        svg.selectAll('polygon.contour')
            .data([0,1,2,3,4,5,6,7,8,9])
            .join('polygon')
            .attr('class', 'contour')
            .attr('fill', d => d3.schemeSpectral[10][d])
            .attr('points', contours(model))
        return svg
    }
    , possibilityWindowPoly = ({ pycx, pycxp, px, pxp }) => {
        const windowLeft = pycx * px
        const windowRight = windowLeft + pxp
        const windowBottom = pycxp * pxp
        const windowTop = windowBottom + px
        return [
              [ 0, 0 ]
            , [ 1, 0 ]
            , [ 1, 1 ]
            , [ 0, 1 ]
            , [ 0, 0 ]
            , [ windowLeft, windowBottom ]
            , [ windowRight, windowBottom ]
            , [ windowRight, windowTop ]
            , [ windowLeft, windowTop ]
            , [ windowLeft, windowBottom ]
            ]
    }
    , svgStringFromCoords = polygon =>
        polygon.map(([x, y]) => `${scaleX(x)},${scaleY(y)}`)
            .join(' ')
    , drawPossibilityWindow = svg => {
        const possibilityWindow = possibilityWindowPoly(model)
        svg.append('polygon')
            .attr('class', 'impossible')
            .attr('points', svgStringFromCoords(possibilityWindow))
            .attr('fill-rule', 'evenodd')
        svg.append('rect')
            .attr('class', 'possible')
            .attr('x', scaleX(possibilityWindow[5][0]))
            .attr('y', scaleY(possibilityWindow[7][1]))
            .attr('width', scaleX(model.pxp) - plotLeft)
            .attr('height', plotBottom - scaleY(model.px))
        return svg
    }
    , inPossibilityWindow = ({px, pxp, pxy, pxpy}) => pyx => pyxp =>
        pxy <= pyx
            && pyx <= pxy + pxp
            && pxpy <= pyxp
            && pyxp <= pxpy + px
    , lowerBound = ({ py }) => pyx => pyxp =>
        Math.max(0, pyx - pyxp, py - pyxp, pyx - py)
    , upperBound = ({ pxy, pxyp, pxpy, pxpyp }) => pyx => pyxp =>
        // outside of possibility window, this could be negative
        Math.max(0, Math.min(pyx, 1 - pyxp, pxy + pxpyp, pyx - pyxp + pxpy + pxyp))
    , updatePlot = svg => model => {
        const possibilityWindow = possibilityWindowPoly(model)
        svg.select('polygon.impossible')
            .attr('points', svgStringFromCoords(possibilityWindow))
        svg.select('rect.possible')
            .attr('x', scaleX(possibilityWindow[5][0]))
            .attr('y', scaleY(possibilityWindow[7][1]))
            .attr('width', scaleX(model.pxp) - plotLeft)
            .attr('height', plotBottom - scaleY(model.px))
        svg.selectAll('polygon.contour')
            .join('polygon')
            .transition()
            .duration(1000)
            .attr('points', contours(model))
    }
    , move = () => {
        const [x, y] = d3.mouse(svg)
            , pyx = scaleX.invert(x)
            , pyxp = scaleY.invert(y)
            , lowerBound_ = lowerBound(model)(pyx)(pyxp)
            , upperBound_ = upperBound(model)(pyx)(pyxp)
            , poss = inPossibilityWindow(model)(pyx)(pyxp)
        if (pyx >= 0 && pyx <= 1 && pyxp >= 0 && pyxp <= 1)
            d3.select('#stats-window')
                // .html(`P(y<sub>x</sub>) = ${round2(pyx)}, P(y<sub>x'</sub>) = ${round2(pyxp)}<br>${round2(lowerBound_)} &le; P(y<sub>x</sub> &gt; y'<sub>x'</sub>) &le; ${round2(upperBound_)}<br>Probability range: ${round2(upperBound_ - lowerBound_)}`)
                .html(`Exp success rates: (${round2(pyx)}, ${round2(pyxp)})<br>Probability of benefiting &ge; ${round2(lowerBound_)}<br>Probability of benefiting &le; ${round2(upperBound_)}<br>Probability range: ${round2(upperBound_ - lowerBound_)}`)
                .classed('impossible', !poss)
                .style('left', `${x - 125}px`)
                .style('top', `${y - 45}px`)
                .style('background-color', _ => pyxp > 0.75 ? `rgba(255, 255, 255, ${2.4 * pyxp - 1.4})` : null)
                .style('border', _ => pyxp > 0.9 ? '1px solid black' : null)
                .transition()
                .duration(100)
                .style('opacity', 1)
    }
    , unhover = () =>
        d3.select('#stats-window')
            .transition()
            .style('opacity', 0)
    , events = selection =>
        selection
            .on('mouseover', move)
            .on('mousemove', move)
            .on('mouseout', unhover)
            .on('touchmove', move)
            .on('touchleave', unhover)
    , draw = compose
        ([ drawPossibilityWindow
         , drawContours
         , drawGridLines
         , drawAxes
         , drawBackground
         ])
    , updateProbabilities = model => {
        ({ px, pycx, pycxp } = model)
        model.pxp = 1 - px
        model.pxy = pycx * px
        model.pxyp = (1 - pycx) * px
        model.pxpy = pycxp * model.pxp
        model.pxpyp = (1 - pycxp) * model.pxp
        model.py = model.pxy + model.pxpy
        pxOutput.innerHTML = round2(px)
        pxpOutput.innerHTML = round2(model.pxp)
        pycxOutput.innerHTML = round2(pycx)
        pycxpOutput.innerHTML = round2(pycxp)
        pxyOutput.innerHTML = round2(model.pxy)
        pxypOutput.innerHTML = round2(model.pxyp)
        pxpyOutput.innerHTML = round2(model.pxpy)
        pxpypOutput.innerHTML = round2(model.pxpyp)
        pyOutput.innerHTML = round2(model.py)
    }
    , updatePlotWithInputNumber = svg => model => e => {
        model[e.target.name] = e.target.valueAsNumber
        updateProbabilities(model)
        updatePlot(svg)(model)
    }
    , createPlot = svgElement => {
        updateProbabilities(model)
        const svg = draw(d3.select(svgElement))
        svg.call(events)
        updatePlot(svg)(model)
        Array.from(document.querySelectorAll('input[type=range]'))
            .map(range =>
                range.addEventListener('input', updatePlotWithInputNumber(svg)(model))
            )
    }

createPlot('#plot')