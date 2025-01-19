import { showModal } from "./modal";

interface AccordionProps {
  title: string;
  content: string;
}

export const createAccordion = ({ title, content }: AccordionProps): HTMLElement => {
  const accordionItem = document.createElement('div');
  accordionItem.className = 'accordion-item';

  accordionItem.innerHTML = `
    <div class="accordion-header">
      <h3 class="accordion-title">${title}</h3>
      <button class="accordion-toggle">+</button>
    </div>
    <div class="accordion-content" style="display: none;">
      <textarea 
        class="accordion-content-input" 
        style="display: none;" 
      >${content}</textarea>
      <p class="editable-content">${content}</p>
      <div class="btn-wrapper">
      <button class="save-btn" style="display: none;">저장</button>
        <button class="delete-btn">삭제</button>
      </div>
    </div>
  `;

  const toggleButton = accordionItem.querySelector('.accordion-toggle');
  const contentDiv = accordionItem.querySelector('.accordion-content') as HTMLElement;
  const contentElement = accordionItem.querySelector('.editable-content') as HTMLElement;
  const contentInput = accordionItem.querySelector('.accordion-content-input') as HTMLTextAreaElement;
  const deleteButton = accordionItem.querySelector('.delete-btn') as HTMLButtonElement;
  const saveButton = accordionItem.querySelector('.save-btn') as HTMLButtonElement;

  toggleButton?.parentElement?.addEventListener('click', () => {
    if (contentDiv.style.display === 'none') {
      contentDiv.style.display = 'block';
      toggleButton.textContent = '−';
    } else {
      contentDiv.style.display = 'none';
      toggleButton.textContent = '+';
    }
  });

  contentElement.addEventListener('click', () => {
    contentElement.style.display = 'none'; 
    contentInput.style.display = 'block'; 
    saveButton.style.display = 'block';
    contentInput.focus(); 

    const saveContent = () => {
      contentElement.textContent = contentInput.value;
      contentInput.style.display = 'none'; 
      contentElement.style.display = 'block'; 
    };

    contentInput.addEventListener('blur', saveContent, { once: true });

    contentInput.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); 
          saveContent();
        }
      },
      { once: true }
    );
  });
  saveButton.addEventListener('click', () => {
    contentElement.textContent = contentInput.value;
    contentInput.style.display = 'none';
    contentElement.style.display = 'block'; 
    saveButton.style.display = 'none'; 
  });
  deleteButton.addEventListener('click', () => {
    showModal({
      title: '삭제 확인',
      message: '정말로 이 항목을 삭제하시겠습니까?',
      buttonText: '삭제',
      onAction: () => {
        accordionItem.remove();
        console.log('아코디언 삭제됨');
      },
      onClose: () => {
        console.log('모달 닫힘');
        document.querySelector('.modal-wrapper')?.remove();
      },
      secondaryButtonText: '취소',
    });
  });

  return accordionItem;
};
