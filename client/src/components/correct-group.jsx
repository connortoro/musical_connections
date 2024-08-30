//import '../App.css';

export default function CorrectGroup({groupKey, choices}) {
    const getColor = (key) => {
      switch(key) {
        case 1: 
          return'#A0C35A';
        case 2:
          return '#F9DF6D'
        case 3:
          return '#B0C4EF'
        case 4:
          return '#BB81C5'
        default:
          return ''
      }
    }

    const getList = () => {
        let res = ''
        for(const choice of choices) {
            res += choice.text + ", "
        }
        return res.slice(0, -2)
    }
  
    return (
      <div className='correct-group fade-in' style={{backgroundColor: getColor(choices[0].key)}}>
        <h4>{groupKey}</h4>
        <p>{getList()}</p>
      </div>
    )
  }