const width = height = 575
    , marginLeft = marginBottom = 50
    , marginTop = marginRight = 25
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
    , model =
        { pycx: +pycxSlider.value
        , pycxp: +pycxpSlider.value
        , px: +pxSlider.value
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
    , possibilityWindowPoly = ({ pycx, pycxp, px }) => {
        const pxp = 1 - px
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
    , possibilityWindowPolyString = model =>
        possibilityWindowPoly(model).map(([x, y]) =>
            `${scaleX(x)}, ${scaleY(y)}`
        ).join(' ')
    , drawPossibilityWindow = svg => {
        svg.append('polygon')
            .attr('class', 'impossible')
            .attr('points', possibilityWindowPolyString(model))
            .attr('fill-rule', 'evenodd')
        return svg
    }
    , updatePlot = svg => model =>// {
        svg.select('polygon.impossible')
            .attr('points', possibilityWindowPolyString(model))
    , draw = compose
        ([ drawPossibilityWindow
         , drawGridLines
         , drawAxes
         ])
    , createPlot = svgElement => {
        const svg = draw(d3.select(svgElement))
        updatePlot(svg)(model)
        pycxSlider.addEventListener('input', onTargetNumber(v => {
            model.pycx = v
            updatePlot(svg)(model)
        }))
        pycxpSlider.addEventListener('input', onTargetNumber(v => {
            model.pycxp = v
            updatePlot(svg)(model)
        }))
        pxSlider.addEventListener('input', onTargetNumber(v => {
            model.px = v
            updatePlot(svg)(model)
        }))
    }
         

createPlot('svg')
