const width = height = 575
    , marginLeft = marginBottom = 50
    , marginTop = marginRight = 25
    , svgRect = document.getElementById('axes').getBoundingClientRect()
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
    , pscmSlider = document.getElementById('pscm-slider')
    , pscmpSlider = document.getElementById('pscmp-slider')
    // , pxSlider = document.getElementById('px-slider')
    // , pmcsSlider = document.getElementById('pmcs-slider')
    , pycxmSlider = document.getElementById('pycxm-slider')
    , pycxmpSlider = document.getElementById('pycxmp-slider')
    , pycxpmSlider = document.getElementById('pycxpm-slider')
    , pycxpmpSlider = document.getElementById('pycxpmp-slider')
    , pscmOutput = document.getElementById('pscm-output')
    , pscmpOutput = document.getElementById('pscmp-output')
    // , pxOutput = document.getElementById('px-output')
    // , pmcsOutput = document.getElementById('pmcs-output')
    , pycxmOutput = document.getElementById('pycxm-output')
    , pycxmpOutput = document.getElementById('pycxmp-output')
    , pycxpmOutput = document.getElementById('pycxpm-output')
    , pycxpmpOutput = document.getElementById('pycxpmp-output')
    // , pyxOutput = document.getElementById('pyx-output')
    // , psOutput = document.getElementById('ps-output')
    // , pyOutput = document.getElementById('py-output')
    // , pxyOutput = document.getElementById('pxy-output')
    , model =
        { pscm: +pscmSlider.value
        , pscmp: +pscmpSlider.value
        // , px: +pxSlider.value
        // , pmcs: +pmcsSlider.value
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
            .text('P(x)')
            .attr('transform', `translate(${[plotLeft + plotWidth/2, plotBottom + 40]})`)
        svg.append('text')
            .attr('class', 'axis-label')
            .text('P(m)')
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
    , pyx = ({pycxm, pycxmp}) => pm =>
        pycxm * pm + pycxmp * (1 - pm)
    , pyxp = ({pycxpm, pycxpmp}) => pm =>
        pycxpm * pm + pycxpmp * (1 - pm)
    , pyxcs = ({pycxm, pycxmp, pycxpm, pycxpmp, pscm, pscmp}) => pm => {
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
    , possible = model => px => pm => {
        const pyx_ = pyx(model)(pm)
        const pyxp_ = pyxp(model)(pm)
        const [pyxcs_, pyxpcs_] = pyxcs(model)(pm)
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
        mapRange(intervals)(x =>
            mapRange(intervals)(y => {
                const px = scaleX.invert(x + plotLeft)
                    , pm = scaleY.invert(y + plotTop)
                    , [pyxcs_2, pyxpcs_2] = pyxcs_(pm)
                    , cRD = cRDDiff(pyx_(pm))(pyxp_(pm))(pyxcs_2)(pyxpcs_2)
                return p(color(cRD)(poss(px)(pm)))(x)(y)
            })
        )
    }
    , move = () => {
        const px = scaleX.invert(d3.event.pageX - svgRect.x)
        const pm = scaleY.invert(d3.event.pageY - svgRect.y)
        const pyx_ = pyx(model)(pm)
        const pyxp_ = pyxp(model)(pm)
        const [pyxcs_, pyxpcs_] = pyxcs(model)(pm)
        d3.select('#stats-window')
            .html(`P(x), P(m) = ${round2(px)}, ${round2(pm)}<br>P(y<sub>x</sub>) = ${round2(pyx_)}<br>P(y<sub>x'</sub>) = ${round2(pyxp_)}<br>P(y<sub>x</sub>|s) = ${round2(pyxcs_)}<br>P(y<sub>x'</sub>|s) = ${round2(pyxpcs_)}<br>C<sub>RD<sub>YX</sub>,RD<sub>YX|S</sub></sub> = ${round2(cRDDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_))}<br>C<sub>RR<sub>YX</sub>,RR<sub>YX|S</sub></sub> = ${round2(cRRDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_))}`)
            .style('left', `${d3.event.pageX - 130}px`)
            .style('top', `${d3.event.pageY - 200}px`)
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
        ({ pscm, pscmp, pycxm, pycxmp, pycxpm, pycxpmp } = model)
        // model.pxp = 1 - px
        // model.pmpcs = 1 - pmcs
        // model.pxy = pycx * px
        // model.pxpy = pycxp * model.pxp
        // model.py = model.pxy + model.pxpy
        // model.pyxcs = pmcs * pycxms + model.pmpcs * pycxmps
        // model.pyxpcs = pmcs * pycxpms + model.pmpcs * pycxpmps
        pscmOutput.value = `P(s|m) = ${round2(pscm)}`
        pscmpOutput.value = `P(s|m') = ${round2(pscmp)}`
        // pxOutput.value = `P(x) = ${round2(px)} (P(x') = ${round2(model.pxp)})`
        // pmcsOutput.value = `P(m|s) = ${round2(pmcs)} (P(m'|s) = ${round2(model.pmpcs)})`
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
        updatePlot(canvas)(model)
        Array.from(document.querySelectorAll('input[type=range]'))
            .map(range =>
                range.addEventListener('input', updatePlotWithInputNumber(svg)(model))
            )
    }
         

createPlot('svg')
