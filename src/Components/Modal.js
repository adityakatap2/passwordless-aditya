import Modal from "react-modal";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");
const renderTime = (time, dimension) => {
    return (
      <div className="time-wrapper">
        <div className="time text-center">{time}</div>
        <div className="text-center">{dimension}</div>
      </div>
    );
  };
const getTimeSeconds = (time) => (10 - time) | 0;
function App(props) {
  let subtitle;
  
  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    props.closeModal();
  }

 

  return (
    <div>
      <Modal
        isOpen={props.isVisible}
        onAfterOpen={afterOpenModal}
        onRequestClose={props.closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
         
          
        <div className="row d-flex justify-content-center">
        <div onClick = {() =>{props.closeModal()}} style={{position:"absolute",top:5,right:5,cursor:"pointer", width:2,zIndex:10}}>&times;</div>
        <p className="text-center">Scan the code below using your Phone's Camera</p>
       
          <div className="col col-lg-6 col-sm-12 text-center">
            <img src={props.image} style={{ width: "16rem" }} />
          </div>
          <div className="col col-lg-6 d-flex justify-content-center align-items-center flex-column">
          <p className="text-center">QR Code will expire in</p>
            <CountdownCircleTimer
              isPlaying={props.isVisible}
              size={120}
              duration={300}
              onComplete = {props.closeModal}
             
              colors={[
                ["#004777", 0.33],
                ["#F7B801", 0.33],
                ["#A30000", 0.33],
              ]}
            >
             {({ remainingTime }) => renderTime(remainingTime,"Seconds")}
        
        
            </CountdownCircleTimer>

           
          </div>
        </div>
       
      </Modal>
    </div>
  );
}

export default App;
