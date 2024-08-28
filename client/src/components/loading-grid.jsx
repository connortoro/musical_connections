import '../App.css';


function LoadingGrid() {
  const row = [1, 1, 1, 1]
  const col = [1, 2, 3, 4]

  return (
    <>
    <h1 className='result-message bump-down'>&nbsp;</h1>
      {row.map((row, rowIdx) => {
            return <div key={rowIdx} className='row'>
              {col.map((cell, colIdx) => {
                return <button className={'loading-button ' + `loading${cell}`}>{}</button>
              })}
            </div>
          })}
    </>
  )
}
export default LoadingGrid;
