const width = height = 575
    , marginLeft = marginBottom = 50
    , marginTop = marginRight = 25
    , svgRect = document.getElementById('plot').getBoundingClientRect()
    , probLocationRadius = 6
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
    , pycxSlider = document.getElementById('pycx-slider')
    , pycxpSlider = document.getElementById('pycxp-slider')
    , pxSlider = document.getElementById('px-slider')
    , pmcsSlider = document.getElementById('pmcs-slider')
    , pycxmsSlider = document.getElementById('pycxms-slider')
    , pycxmpsSlider = document.getElementById('pycxmps-slider')
    , pycxpmsSlider = document.getElementById('pycxpms-slider')
    , pycxpmpsSlider = document.getElementById('pycxpmps-slider')
    , pycxOutput = document.getElementById('pycx-output')
    , pycxpOutput = document.getElementById('pycxp-output')
    , pxOutput = document.getElementById('px-output')
    , pmcsOutput = document.getElementById('pmcs-output')
    , pycxmsOutput = document.getElementById('pycxms-output')
    , pycxmpsOutput = document.getElementById('pycxmps-output')
    , pycxpmsOutput = document.getElementById('pycxpms-output')
    , pycxpmpsOutput = document.getElementById('pycxpmps-output')
    , pyxOutput = document.getElementById('pyx-output')
    , pyOutput = document.getElementById('py-output')
    , pxyOutput = document.getElementById('pxy-output')
    , model =
        { pycx: +pycxSlider.value
        , pycxp: +pycxpSlider.value
        , px: +pxSlider.value
        , pmcs: +pmcsSlider.value
        , pycxms: +pycxmsSlider.value
        , pycxmps: +pycxmpsSlider.value
        , pycxpms: +pycxpmsSlider.value
        , pycxpmps: +pycxpmpsSlider.value
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
            .call(textWithSub('P(y')('x')(')'))
            .attr('transform', `translate(${[plotLeft + plotWidth/2, plotBottom + 40]})`)
        svg.append('text')
            .attr('class', 'axis-label')
            .call(textWithSub('P(y')('x\'')(')'))
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
            .call(events)
        svg.selectAll('line.grid.y')
            .data(d3.range(0.1, 1, 0.1))
            .join('line')
            .attr('class', 'grid y')
            .attr('x1', leftEdge)
            .attr('x2', rightEdge)
            .attr('y1', scaleY)
            .attr('y2', scaleY)
            .call(events)
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
    , possibilityWindowPolyString = possibilityWindowPolygon =>
        possibilityWindowPolygon.map(([x, y]) =>
            `${scaleX(x)}, ${scaleY(y)}`
        ).join(' ')
    , drawPossibilityWindow = svg => {
        const possibilityWindow = possibilityWindowPoly(model)
        svg.append('polygon')
            .attr('class', 'impossible')
            .attr('points', possibilityWindowPolyString(possibilityWindow))
            .attr('fill-rule', 'evenodd')
            .call(events)
        svg.append('rect')
            .attr('class', 'possible')
            .attr('x', scaleX(possibilityWindow[5][0]))
            .attr('y', scaleY(possibilityWindow[7][1]))
            .attr('width', scaleX(model.pxp) - plotLeft)
            .attr('height', plotBottom - scaleY(model.px))
            .call(events)
        return svg
    }
    , drawProbLocation = svg => {
        const filter = svg.append('defs')
            .append('filter')
            .attr('id', 'shadow')
        filter.append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 0)
            .attr('stdDeviation', 1)
        svg.append('circle')
            .attr('class', 'prob-location')
            .attr('cx', scaleX(model.pyxcs))
            .attr('cy', scaleY(model.pyxpcs))
            .attr('r', probLocationRadius)
            .style('filter', 'url(#shadow)')
            .classed('danger', !inPossibilityWindow(model))
            .call(events)
        return svg
    }
    , inPossibilityWindow = model =>
        model.pxy <= model.pyxcs
            && model.pyxcs <= model.pxy + model.pxp
            && model.pxpy <= model.pyxpcs
            && model.pyxpcs <= model.pxpy + model.px
    , updatePlot = svg => model => {
        const possibilityWindow = possibilityWindowPoly(model)
        svg.select('polygon.impossible')
            .attr('points', possibilityWindowPolyString(possibilityWindow))
            .classed('danger', !inPossibilityWindow(model))
        svg.select('rect.possible')
            .attr('x', scaleX(possibilityWindow[5][0]))
            .attr('y', scaleY(possibilityWindow[7][1]))
            .attr('width', scaleX(model.pxp) - plotLeft)
            .attr('height', plotBottom - scaleY(model.px))
            .classed('danger', !inPossibilityWindow(model))
        svg.select('circle.prob-location')
            .attr('cx', scaleX(model.pyxcs))
            .attr('cy', scaleY(model.pyxpcs))
            .classed('danger', !inPossibilityWindow(model))
    }
    , move = () => {
        const yx = scaleX.invert(d3.event.pageX - svgRect.x)
        const yxp = scaleY.invert(d3.event.pageY - svgRect.y)
        d3.select('#stats-window')
            .html(`P(y<sub>x</sub>) = ${round2(yx)}<br>P(y<sub>x'</sub>) = ${round2(yxp)}`)
            .style('left', `${d3.event.pageX - 107}px`)
            .style('top', `${d3.event.pageY - 80}px`)
            .transition()
            .duration(100)
            .style('opacity', 1)
    }
    , hover = () => {
        const yx = scaleX.invert(d3.event.pageX - svgRect.x)
        const yxp = scaleY.invert(d3.event.pageY - svgRect.y)
        d3.select('#stats-window')
            .html(`P(y<sub>x</sub>) = ${round2(yx)}<br>P(y<sub>x'</sub>) = ${round2(yxp)}`)
            .style('left', `${d3.event.pageX - 107}px`)
            .style('top', `${d3.event.pageY - 80}px`)
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
            .on('mouseover', hover)
            .on('mousemove', move)
            .on('mouseout', unhover)
            .on('touchmove', move)
            .on('touchleave', unhover)
    , draw = compose
        ([ drawProbLocation
         , drawPossibilityWindow
         , drawGridLines
         , drawAxes
         ])
    , updateProbabilities = model => {
        ({ pycx, pycxp, px, pmcs, pycxms, pycxmps, pycxpms, pycxpmps } = model)
        model.pxp = 1 - px
        model.pmpcs = 1 - pmcs
        model.pxy = pycx * px
        model.pxpy = pycxp * model.pxp
        model.py = model.pxy + model.pxpy
        model.pyxcs = pmcs * pycxms + model.pmpcs * pycxmps
        model.pyxpcs = pmcs * pycxpms + model.pmpcs * pycxpmps
        pycxOutput.value = `P(y|x) = ${round2(pycx)}`
        pycxpOutput.value = `P(y|x') = ${round2(pycxp)}`
        pxOutput.value = `P(x) = ${round2(px)} (P(x') = ${round2(model.pxp)})`
        pmcsOutput.value = `P(w|s) = ${round2(pmcs)} (P(w'|s) = ${round2(model.pmpcs)})`
        pycxmsOutput.value = `P(y|x, w, s) = ${round2(pycxms)}`
        pycxmpsOutput.value = `P(y|x, w', s) = ${round2(pycxmps)}`
        pycxpmsOutput.value = `P(y|x', w, s) = ${round2(pycxpms)}`
        pycxpmpsOutput.value = `P(y|x', w', s) = ${round2(pycxpmps)}`
        pxyOutput.value = `P(x, y) = ${round2(model.pxy)}, P(x, y') = ${round2(px - model.pxy)}, P(x', y) = ${round2(model.pxpy)}, P(x', y') = ${round2(model.pxp - model.pxpy)}`
        pyOutput.value = `P(y) = ${round2(model.py)}`
        pyxOutput.innerHTML = `P(y<sub>x</sub>|s) = ${round2(model.pyxcs)}, P(y<sub>x'</sub>|s) = ${round2(model.pyxpcs)}`
    }
    , updatePlotWithInputNumber = svg => model => e => {
        model[e.target.name] = e.target.valueAsNumber
        updateProbabilities(model)
        updatePlot(svg)(model)
    }
    , createPlot = svgElement => {
        updateProbabilities(model)
        const svg = draw(d3.select(svgElement))
        updatePlot(svg)(model)
        Array.from(document.querySelectorAll('input[type=range]'))
            .map(range =>
                range.addEventListener('input', updatePlotWithInputNumber(svg)(model))
            )
    }
         

createPlot('svg')
