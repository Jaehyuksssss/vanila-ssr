interface BottomSheetProps {
    title: string;
    content: string;
    buttonText: string;
    onClose: () => void;
  }
  
  export const createBottomSheet = ({
    title,
    content,
    buttonText,
    onClose,
  }: BottomSheetProps): HTMLElement => {
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet-wrapper dimmed';
  
    sheet.innerHTML = `
      <div class="bottom-sheet">
        <div class="bottom-sheet-header">
          <h2>${title}</h2>
          <button id="close-bottom-sheet" class="btn-close">×</button>
        </div>
        <div class="bottom-sheet-content">
          <p>${content}</p>
        </div>
        <div class="bottom-sheet-actions">
          <button id="bottom-sheet-action-btn" class="btn-primary">${buttonText}</button>
        </div>
      </div>
    `;
  
    sheet.querySelector('#close-bottom-sheet')?.addEventListener('click', onClose);
    sheet.querySelector('#bottom-sheet-action-btn')?.addEventListener('click', onClose);
  
    return sheet;
  };
  
  export const showBottomSheet = (props: BottomSheetProps): void => {
    const sheet = createBottomSheet(props);
    document.body.appendChild(sheet);
  
    const closeSheet = () => {
      sheet.classList.add('closing');
      setTimeout(() => {
        if (document.body.contains(sheet)) {
          document.body.removeChild(sheet);
        }
      }, 300); 
    };
  
    const handleClose = () => {
      closeSheet();
      props.onClose?.();
    };
  
    sheet.querySelector('#close-bottom-sheet')?.addEventListener('click', handleClose);
    sheet.querySelector('#bottom-sheet-action-btn')?.addEventListener('click', handleClose);
  };
  