const process = require('process')
const childProcess = require('child_process')
const { setTimeout } = require('timers')

const exec = (cmd) => {
    return new Promise((resolve, reject) => {
		childProcess.exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else {
                resolve([stdout, stderr])
            }
        })
    })
}

let isFront = true
const level = parseInt(process.argv.at(-3)) ?? 1
const count = parseInt(process.argv.at(-2)) ?? 4
const time = parseInt(process.argv.at(-1)) ?? 3

const possibleMoves = [
	{ name: "jab", front: true, back: false },
	{ name: "direto", front: false, back: true },
	{ name: "cruza", front: true, back: true },
	{ name: "chuta", front: true, back: true, leg: true },
	{ name: "tip", front: true, back: true, leg: true },
	{ name: "upper", front: true, back: true },
	{ name: "cotovelo", front: true, back: true },
	{ name: "joelho", front: true, back: true, leg: true },
].slice(0, level + 1)

const nextMove = (moves, count, isFront) => {
	const rules = []

	// somente movimentos permitidos para aquele lado, ex:
	// jab só na frente, direto só com o braço de trás
	if (isFront) {
		rules.push(m => m.front)
	} else {
		rules.push(m => m.back)
	}

	// exigir perna para ultimo golpe quando forem 4 ou mais movimentos
	if (possibleMoves.some(m => m.leg)) {
		if (count >= 4 && moves.length === count - 1) {
			rules.push(m => m.leg)
		} else if (count !== 1) {
			rules.push(m => !m.leg)
		}
    }

	// sem jab par depois de um direto
	if ((moves.length + 1) % 2 == 0 && (moves.at(-1).name == "direto")) {
		rules.push(m => m.name !== "jab")
	}

	const allowedMoves = possibleMoves.filter(m => rules.every(r => r(m)))
	const i = Math.floor(Math.random() * allowedMoves.length)
	return allowedMoves[i]
}

const generateSequence = async () => {
	const moves = []

    const side = isFront ? 'F:' : 'T:'

	for (let i = 0; i < count; i++) {
		const move = nextMove(moves, count, isFront)
		moves.push(move)
		isFront = !isFront
	}

	console.log(side, moves.map(m => m.name).join(' '))

    for (const m of moves) {
        await exec(`mplayer ./sound/${m.name}.mp3`)
    }

    setTimeout(generateSequence, time)
}

generateSequence()
