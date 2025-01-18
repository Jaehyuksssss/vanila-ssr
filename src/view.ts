import { showModal } from "./components/modal";
import { showToast } from "./components/toast";
import { Handlers } from "./triggers";

export default class CardsHandler implements Handlers {
  private modalOpenBtn : HTMLButtonElement
  private toastOpenBtn : HTMLButtonElement
  constructor() {
    this.modalOpenBtn= document.getElementById('open-modal-btn') as HTMLButtonElement
    this.toastOpenBtn=document.getElementById('open-toast-btn') as HTMLButtonElement

    this.init();
  }

  init() {
    console.log("create cradHandler init");
    this.setEventListener();
  }

  private setEventListener() {
    this.openModalHandler()
    this.openToastHandler()
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
  private openToastHandler(){
    this.toastOpenBtn.addEventListener('click',()=>{
      showToast({ message: '저장 성공!', type: 'success' ,duration:2000});
    })
  }
  

}
new CardsHandler();