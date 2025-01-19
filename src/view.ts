import { showModal } from "./components/modal";
import { showToast } from "./components/toast";
import { createAccordion } from "./components/accordion";
import { Handlers } from "./triggers";

export default class CardsHandler implements Handlers {
  private modalOpenBtn : HTMLButtonElement
  private toastOpenBtn : HTMLButtonElement
  private accordionOpenBtn: HTMLButtonElement;
  private accordionWrapper: HTMLElement;
  
  constructor() {
    this.modalOpenBtn= document.getElementById('open-modal-btn') as HTMLButtonElement
    this.toastOpenBtn=document.getElementById('open-toast-btn') as HTMLButtonElement
    this.accordionOpenBtn = document.getElementById("open-accordion-btn") as HTMLButtonElement;
    this.accordionWrapper = document.getElementById("accordion-wrapper") as HTMLElement;

    this.init();
  }

  init() {
    console.log("create cradHandler init");
    this.setEventListener();
  }

  private setEventListener() {
    this.openModalHandler()
    this.openToastHandler()
    this.openAccordionHandler();
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
  private openAccordionHandler() {
    this.accordionOpenBtn.addEventListener("click", () => {
      const newAccordion = createAccordion({
        title: "새로운 아코디언",
        content: "이것은 새로 추가된 아코디언입니다.",
      });
      this.accordionWrapper.appendChild(newAccordion);
    });
  }

}
new CardsHandler();