const log = message => val => {
    console.log(message, val)
    return val
}

const urlParams = new URLSearchParams(window.location.search)

const floatParam = name => def =>
    parseFloat(urlParams.get(name) || def)

const round1 = x =>
    Math.round(x * 10) / 10

const round2 = x =>
    Math.round(x * 100) / 100

const disableInput = disabled => input => input.disabled = disabled

const fracRangeReduce = init => f => n =>
    [...Array(n)].reduce((acc, _, i) => f(acc)(i / (n - 1)), init)

const mapRange = n => f =>
    [...Array(n)].map((_, i) => f(i))

const rangeStep = n => step =>
    mapRange(n)(i => i * step)

const mapRangeStep = n => step => f =>
    mapRange(n)(i => f(i * step))

const onTargetNumber = f => e => f(e.target.valueAsNumber)

const addEventListener = event => f => element =>
    element.addEventListener(event, e => f(e.target.value))

const addEventListeners = elements => event => f =>
    Array.from(elements)
        .map(addEventListener(event)(f))

const compose = fs => arg =>
    fs.reduceRight((acc, f) => f(acc), arg)