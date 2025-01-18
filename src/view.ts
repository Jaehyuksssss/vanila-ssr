import { showModal } from "./components/modal";
import { Handlers } from "./triggers";

export default class CardsHandler implements Handlers {
  private modalOpenBtn : HTMLButtonElement

  constructor() {
    this.modalOpenBtn= document.getElementById('open-modal-btn') as HTMLButtonElement
    this.init();
  }

  init() {
    console.log("create cradHandler init");
    this.setEventListener();
  }

  private setEventListener() {
    this.openModalHandler()
  }
 
  private openModalHandler (){
    this.modalOpenBtn.addEventListener('click',()=>{
      showModal({
        title: '이건 모달 컴포넌트 타이틀',
        message: '이건 모달에 들어갈 내용',
        buttonText: '닫힌다',
        onClose: () =>{console.log('callback 형태로 넣으면 실행됨')}
    });
    })


  }

}
new CardsHandler();