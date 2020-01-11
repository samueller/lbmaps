// const delta = 0.02
// const kDelta = 0.01
// const tDelta = 0.25

const inPossibilityWindow = pxy => pxpy => pyx => pyxp => px => pxp =>
        pxy <= pyx
            && pyx <= pxy + pxp
            && pxpy <= pyxp
            && pyxp <= pxpy + px
    , cRDDiff = pyx => pyxp => pyxcs => pyxpcs =>
        pyx - pyxp - (pyxcs - pyxpcs)
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

const c = (k, t, u, v, w, x, y, z) => {
    const point = { pm: u, pycxm: v, pycxmp: w, pycxpm: x, pycxpmp: y }
        , pyx_ = pyx(point)
        , pyxp_ = pyxp(point)
        , [pyxcs_, pyxpcs_] = pyxcs(point)(z)(z - k)
    return inPossibilityWindow(pyx_ * t)(pyxp_ * (1 - t))(pyxcs_)(pyxpcs_)(t)(1 - t)
        ? cRDDiff(pyx_)(pyxp_)(pyxcs_)(pyxpcs_)
        : 0
}
const updateC = (best, k, t, u, v, w, x, y, z) => {
    const cMax = c(k, t, u, v, w, x, y, z)
    if (best.cMax < cMax) {
        best.cMax = cMax
        best.t = t
        best.u = u
        best.v = v
        best.w = w
        best.x = x
        best.y = y
        best.z = z
        console.log('new best:', best)
    }
}

const nextC = (best, k, t, u, v, w, x, y, z) => {
    const cMax = c(k, t, u, v, w, x, y, z)
    if (best.cMax < cMax)
        return log('New best')({cMax, k, t, u, v, w, x, y, z})
    else
        return best
}
const fracRangeStartReduce = init => startIndex => n => f =>
    [...Array(n - startIndex)]
        .reduce((acc, _, i) => f(acc)((i + startIndex) / (n - 1)), init)
const log = message => val => {
    console.log(new Date().toString(), message, val)
    return val
}

// let bests = []
// for (let k = kDelta; k <= 1; k += kDelta) {
//     const best = {cMax: 0, k: k}
//     for (let t = 0; t <= 1; t += tDelta)
//         for (let u = delta; u <= 1; u += delta) {
//             for (let v = 0; v <= 1; v += delta)
//                 for (let w = 0; w <= 1; w += delta)
//                     for (let x = 0; x <= 1; x += delta)
//                         for (let y = 0; y <= 1; y += delta)
//                             for (let z = k; z <= 1; z += delta)
//                                 updateC(best, k, t, u, v, w, x, y, z)
//             console.log(`Tried all parameters for k = ${k}, P(x) = ${t}, P(m) = ${u}`)
//         }
//     bests.push(best)
// }
const numKs = 101
    , numParams = 101
    , numTs = 21
    // , t = 0.75
    , u = 1
    // , y = 0.5
log('Final C_max\'s for each k')(
fracRangeStartReduce([])(numKs - 2)(numKs)(bests => k =>
    bests.concat(log(`Finished k=${k}`)(
        fracRangeStartReduce({cMax: 0, k: k})(1)(numTs)(best => t =>
        // fracRangeStartReduce({cMax: 0, k: k})(1)(numParams)(best => u =>
        // fracRangeStartReduce(best)(1)(numParams)(best => u =>
            log(`Finished params for k=${k}, P(x)=${t}, P(m)=${u}`)(
                fracRangeStartReduce(best)(0)(numParams)(best => v =>
                fracRangeStartReduce(best)(0)(numParams)(best => w =>
                    fracRangeStartReduce(best)(0)(numParams)(best => x =>
                        fracRangeStartReduce(best)(0)(numParams)(best => y =>
                            fracRangeStartReduce(best)(k*(numKs - 1))(numKs)(best => z =>
                                nextC(best, k, t, u, v, w, x, y, z)
                            )
                        )
                    )
                )
                )
            )
        )//)
    ))
)
)