import { useState, useEffect } from "react";
export default function Home() {
    const [canMove, setCanMove] = useState(false);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0);
    const [modalGameOver, setModalGameOver] = useState(false);
    const [isGameInProgress, setIsGameInProgress] = useState(false);

    const dimension = 4;

    const createGrill = () => {
        let grill = [];
        for (let i = 0; i < dimension; i++) {
            let row = new Array(dimension).fill(null);
            grill.push(row);
        }
        return grill;
    };

    function startGame() {
        const newGrill = createGrill();
        placeRandomNumber(newGrill);
        placeRandomNumber(newGrill);
        setGrill(newGrill);
        setCanMove(true);
        setModalGameOver(false);
        setTime(0);
        setIsGameInProgress(true);
    }

    function getTwoOrFour() {
        const randomNumber = Math.random();
        return randomNumber > 0.7 ? 4 : 2;
    };

    const [grill, setGrill] = useState(createGrill());

    const handleKeyPress = (e) => {
        if (![37, 38, 39, 40].includes(e.keyCode) || !canMove) return;
        e.preventDefault();

        const newGrill = JSON.parse(JSON.stringify(grill));

        if (e.keyCode === 38) moveLeft(newGrill);
        else if (e.keyCode === 37) moveUp(newGrill);
        else if (e.keyCode === 40) moveRight(newGrill);
        else if (e.keyCode === 39) moveDown(newGrill);

        if (checkLose()) {
            setIsGameInProgress(false);
            setModalGameOver(true);
        } else {
            placeRandomNumber(newGrill);
            setGrill(newGrill);
        }

        if (checkWinCondition()) {
            setCanMove(false);
        }
    };

    const moveLeft = (newGrill) => {
        for (let row = 0; row < dimension; row++) {
            let newRow = newGrill[row].filter((val) => val !== null);
            newRow = combineNumbers(newRow);
            while (newRow.length < dimension) newRow.push(null);
            newGrill[row] = newRow;
        }
    };

    const moveRight = (newGrill) => {
        for (let row = 0; row < dimension; row++) {
            let newRow = newGrill[row].filter((val) => val !== null);
            newRow = combineNumbers(newRow.reverse()).reverse();
            while (newRow.length < dimension) newRow.unshift(null);
            newGrill[row] = newRow;
        }
    };

    const moveUp = (newGrill) => {
        for (let col = 0; col < dimension; col++) {
            let newCol = newGrill.map((row) => row[col]).filter((val) => val !== null);
            newCol = combineNumbers(newCol);
            while (newCol.length < dimension) newCol.push(null);
            for (let row = 0; row < dimension; row++) {
                newGrill[row][col] = newCol[row];
            }
        }
    };

    const moveDown = (newGrill) => {
        for (let col = 0; col < dimension; col++) {
            let newCol = newGrill.map((row) => row[col]).filter((val) => val !== null);
            newCol = combineNumbers(newCol.reverse()).reverse();
            while (newCol.length < dimension) newCol.unshift(null);
            for (let row = 0; row < dimension; row++) {
                newGrill[row][col] = newCol[row];
            }
        }
    };

    const combineNumbers = (arr) => {
        let combined = false;
        const combinedArr = arr.map((val) => val);
        let combineScore = 0;

        for (let i = 0; i < combinedArr.length - 1; i++) {
            if (combinedArr[i] === combinedArr[i + 1] && combinedArr[i] !== null) {
                combinedArr[i] *= 2;
                combinedArr[i + 1] = null;
                combined = true;
                combineScore += combinedArr[i];
            }
        }

        if (combined) {
            setScore((prevScore) => prevScore + combineScore);
        }

        return combinedArr.filter((val) => val !== null);
    };

    const checkWinCondition = () => {
        for (let row = 0; row < dimension; row++) {
            for (let col = 0; col < dimension; col++) {
                if (grill[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    };

    const placeRandomNumber = (newGrill) => {
        const availablePositions = [];
        for (let row = 0; row < dimension; row++) {
            for (let col = 0; col < dimension; col++) {
                if (newGrill[row][col] === null) {
                    availablePositions.push({ row, col });
                }
            }
        }

        if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const { row, col } = availablePositions[randomIndex];
            newGrill[row][col] = getTwoOrFour();
        }
    };

    function checkLose() {
        for (let row = 0; row < dimension; row++) {
            for (let col = 0; col < dimension; col++) {
                if (grill[row][col] === null) {
                    return false;
                }
                if (row + 1 < dimension && grill[row][col] === grill[row + 1][col]) {
                    return false;
                }
                if (col + 1 < dimension && grill[row][col] === grill[row][col + 1]) {
                    return false;
                }
            }
        }
        if (modalGameOver) {
            setIsGameInProgress(false);
            return true;
        }
        return true;
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [grill]);

    useEffect(() => {
        let interval;

        if (canMove && isGameInProgress) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [canMove, isGameInProgress]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = seconds.toString().padStart(2, "0");
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleCloseModal = () => {
        setModalGameOver(false);
    };

    useEffect(() => {
        console.log(modalGameOver);
    }, [modalGameOver]);

    return (
        <div className='h-screen flex flex-col justify-center items-center relative'>
            <div className="flex justify-center items-center gap-16">
                <p>Time: {formatTime(time)}</p>
                <p>Score: {score}</p>
            </div>
            <div className='grid grid-cols-4 gap-2 my-4 px-4'>
                {modalGameOver && (
                    <div className="fixed inset-0 flex items-center justify-center ">
                        <div className="flex flex-col items-center justify-center z-50 gap-5 rounded-lg shadow-lg bg-white p-8 w-[450px] h-[250px]">
                            <p className="text-red-500 font-bold text-4xl mt-4 bg-white">Game Over</p>
                            <button onClick={startGame} className='px-4 py-2 bg-blue-500 text-white rounded'>Try Again</button>
                        </div>
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-neutral-800 opacity-75"></div>
                        </div>
                    </div>
                )}
                {grill.map((row, rowIndex) => (
                    <div key={rowIndex} className='grid grid-cols-1 gap-2'>
                        {row.map((value, colIndex) => (
                            <div
                                key={colIndex}
                                className='bg-gray-300 p-4 flex items-center justify-center font-bold text-3xl h-[50px] w-[50px] sm:h-[80px] sm:w-[80px] md:h-[120px] md:w-[120px]'
                            >
                                {value || ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className='flex justify-center items-center'>
                <button
                    onClick={startGame}
                    className='px-4 py-2 bg-blue-500 text-white rounded'
                >
                    {!canMove ? "Start Game" : "New Game"}
                </button>
            </div>
        </div>
    );
}
