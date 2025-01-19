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
        <p class="editable-content">${content}</p>
        <input 
          type="text" 
          class="editable-input" 
          value="${content}" 
          style="display: none;" 
        />
      </div>
    `;
  
    const toggleButton = accordionItem.querySelector('.accordion-toggle');
    const contentDiv = accordionItem.querySelector('.accordion-content');
    const contentElement = accordionItem.querySelector('.editable-content') as HTMLElement;
    const inputElement = accordionItem.querySelector('.editable-input') as HTMLInputElement;
  
    toggleButton?.addEventListener('click', () => {
      const content = contentDiv as HTMLElement;
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleButton!.textContent = '−';
      } else {
        content.style.display = 'none';
        toggleButton!.textContent = '+';
      }
    });
  
    contentElement?.addEventListener('click', () => {
      contentElement.style.display = 'none'; 
      inputElement.style.display = 'block'; 
      inputElement.focus(); 
    });
  
    const saveContent = () => {
      const newValue = inputElement.value.trim();
      contentElement.textContent = newValue; 
      inputElement.style.display = 'none'; 
      contentElement.style.display = 'block'; 
    };
  
    inputElement.addEventListener('blur', saveContent);
  
    inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        saveContent();
      }
    });
  
    return accordionItem;
  };
  