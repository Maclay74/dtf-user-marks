import React, { ChangeEvent, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { getFromStorage, saveToStorage, removeFromStorage, Badge } from '../utils/storage';

export interface EditBadeModalProps {
  id: string;
  afterSave: () => void;
}

const EditBadgeModal = ({ id, afterSave }: EditBadeModalProps) => {
  const [badge, setBadge] = useState<Badge>({ text: 'нейтрально', type: 'blue' });
  const [checkboxValue, setCheckboxValue] = useState('');

  const onBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).classList.contains('v-popup-fp-overlay')) {
      const component = document.querySelector('.v-popup-fp-container');
      component && ReactDOM.unmountComponentAtNode(component);
    }
  };

  useEffect(() => {
    getFromStorage(id).then(result => {
      if (!result) return;
      const data = result[id];

      if (data) {
        // DTF's ui is full of shit, so
        setCheckboxValue(data.type === 'blue' ? '' : 'ui-checkbox--checked');
        setBadge(data);
      }
    });
  }, [id]);

  const onChangeText = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setBadge({
      ...badge,
      text: value,
    });
  };

  const onChangeType = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();

    const newValue = badge.type === 'blue' ? 'red' : 'blue';

    setBadge({
      ...badge,
      type: newValue,
    });
  };

  const onSaveClick = async () => {
    if (!badge.text?.length)
      badge.text = 'нейтрально';

    // If it's default values, just remove it from storage
    if (badge.text === 'нейтрально' && badge.type === 'blue') {
      await removeFromStorage(id);
    } else {
      await saveToStorage({ [id]: badge });
    }

    afterSave && await afterSave();
    const component = document.querySelector('.v-popup-fp-container');
    component && ReactDOM.unmountComponentAtNode(component);
  };

  return (
    <div className={'v-popup-fp-overlay'} onClick={onBackgroundClick}>
      <div className={'v-popup-fp-window'} style={{ maxWidth: 380 }}>
        <div className={'v-popup-fp-window__body modal-body ui_form ui_form--2'}>
          <h3 className='modal-title'>Редактировать бейдж</h3>

          <fieldset>
            <label htmlFor='form_input_719'>Текст</label>
            <input type='text' value={badge?.text} onChange={onChangeText} />
          </fieldset>

          <fieldset>
            <span className={'ui-checkbox ' + checkboxValue} onClick={onChangeType}>
                <input type='checkbox' name={'type-checkbox'} className='checkbox__input' />
            </span>
            <label htmlFor='type-checkbox'>Негативный</label>
          </fieldset>

          <div className={'ui-button ui-button--1'} onClick={onSaveClick}>Сохранить</div>
        </div>
      </div>
    </div>
  );
};

export default EditBadgeModal;
