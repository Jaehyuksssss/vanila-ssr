
import { createAccordion } from "./components/accordion";
import { showBottomSheet } from "./components/bottomsheet";
import { showCards } from "./components/card";
import { showModal } from "./components/modal";
import { showToast } from "./components/toast";
import { Handlers } from "./triggers";

export default class viewHandler implements Handlers {
  private modalOpenBtn : HTMLButtonElement
  private toastOpenBtn : HTMLButtonElement
  private accordionOpenBtn: HTMLButtonElement;
  private accordionWrapper: HTMLElement;
  private bottomsheetOpenBtn: HTMLButtonElement;
  private cardOpenBtn: HTMLButtonElement;
  
  constructor() {
    this.modalOpenBtn= document.getElementById('open-modal-btn') as HTMLButtonElement
    this.toastOpenBtn=document.getElementById('open-toast-btn') as HTMLButtonElement
    this.accordionOpenBtn = document.getElementById("open-accordion-btn") as HTMLButtonElement;
    this.accordionWrapper = document.getElementById("accordion-wrapper") as HTMLElement;
    this.bottomsheetOpenBtn=document.getElementById('open-bottom-sheet-btn') as HTMLButtonElement
    this.cardOpenBtn=document.getElementById('open-card-btn') as HTMLButtonElement
    this.init();
  }

  init() {
    this.setEventListener();
  }

  private setEventListener() {
    this.openModalHandler()
    this.openToastHandler()
    this.openAccordionHandler();
    this.openBottomSheetHandler();
    this.openCardHandler()
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
      showToast({ message: '저장 성공', type: 'success' ,duration:2000});
    })
  }

  private openAccordionHandler() {
    this.accordionWrapper.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    this.accordionOpenBtn.addEventListener("click", () => {
      const newAccordion = createAccordion({
        title: "새로운 아코디언",
        content: "이것은 새로 추가된 아코디언입니다.",
        onAction: () => {
          console.log("삭제 확인 버튼 클릭");
        },
        onClose: () => {
          console.log("모달 닫기 버튼 클릭");
          document.querySelector('.modal-wrapper')?.remove();
        },
      });
      this.accordionWrapper.appendChild(newAccordion);
    });
  }

  private openBottomSheetHandler() {
    this.bottomsheetOpenBtn.addEventListener('click', () => {
      showBottomSheet({
        title: '바텀시트 타이틀',
        content: '이것은 바텀시트 내용입니다.',
        buttonText: '닫기',
        onClose: () => console.log('바텀시트 닫힘'),
      });
    });
  }
  private openCardHandler() {
    this.cardOpenBtn.addEventListener('click', () => {
      showCards(cardDataArray.map(card => ({
        ...card,
        imageUrl: card.imgUrl,
        buttonText: '자세히 보기',
        onButtonClick: () => console.log('카드 버튼 클릭')
      })), 'main-wrapper');
    });
  }
}
new viewHandler();


interface CardProps {
  title: string;
  imgUrl: string; 
  description: string;
}

export const cardDataArray: CardProps[] = [
  {
    title: 'Card 1',
    imgUrl: '/cute.png',
    description: '이것은 카드 내용1입니다.',
  },
  {
    title: 'Card 2',
    imgUrl: '/cute.png',
    description: '이것은 카드 내용2입니다.',
  },
  {
    title: 'Card 3',
    imgUrl: '/cute.png',
    description: '이것은 카드 내용3입니다.',
  },
]
