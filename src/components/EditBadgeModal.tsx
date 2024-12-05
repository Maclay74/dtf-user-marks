import React, { useEffect, useState } from "react";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  badge,
} from "../utils/storage";

interface EditBadgeModalProps {
  id: number;
  afterSave: () => Promise<void>;
}

const EditBadgeModal = ({ id, afterSave }: EditBadgeModalProps) => {
  const [badge, setBadge] = useState<badge>({
    text: "нейтрально",
    type: "blue",
  });
  const [checkboxValue, setCheckboxValue] = useState(false);

  const onClose = () => {
    document.querySelector(".modal-badge")?.remove();
  };

  useEffect(() => {
    getFromStorage(id.toString()).then((result) => {
      if (!result) return;
      const data = result[id];

      if (data) {
        setCheckboxValue(data.type !== "blue");
        setBadge(data);
      }
    });
  }, [id]);

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setBadge({
      ...badge,
      text: value,
    });
  };

  const onChangeType = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    event.preventDefault();

    const newValue = badge.type === "blue" ? "red" : "blue";
    setCheckboxValue(!checkboxValue);

    setBadge({
      ...badge,
      type: newValue,
    });
  };

  const onSaveClick = async () => {
    if (!badge.text?.length) badge.text = "нейтрально";

    // If it's default values, just remove it from storage
    if (badge.text === "нейтрально" && badge.type === "blue") {
      await removeFromStorage(id.toString());
    } else {
      await saveToStorage({ [id]: badge });
    }

    afterSave && (await afterSave());
    onClose();
  };

  const onResetClick = async () => {
    await removeFromStorage(id.toString());
    afterSave && (await afterSave());
    onClose();
  };

  return (
    <div className={'modal-window'}>
      <div className={'modal-window__header modal-window__header--static'}>
        <div className={'modal-window__title'}>Редактировать метку</div>
        <button className={'icon-button modal-window__close'} type={'button'} onClick={onClose}>
          <svg className={'icon icon--cross'} width="24" height="24">
            <use xlinkHref="#cross"></use>
          </svg>
        </button>
      </div>

      <div className={'modal-window__content'} data-scrollable={'true'}>
        <div className="form-section">
          <div className="form-section__label">Текст</div>
          <div className="field field--default">
            <label className="field__wrapper">
              <div className="field__wrapper-body">
                <input
                  tabIndex={0}
                  type="text"
                  value={badge?.text}
                  onChange={onChangeText}
                  placeholder=""
                  className="text-input"
                  maxLength={30}
                />
              </div>
            </label>
          </div>

          <label className={'checkbox ' + (checkboxValue ? 'checkbox--checked' : '')}>
            <input
              type="checkbox"
              tabIndex={1}
              className="checkbox__input"
              onClick={onChangeType}
            />
            <div className="checkbox__control">
              {checkboxValue && (
                <svg className="icon icon--tick checkbox__icon" width="16" height="16">
                  <use xlinkHref="#tick"></use>
                </svg>
              )}
            </div>
            <div className="checkbox__caption">Негативный</div>
          </label>
        </div>

        <div className="buttons">
          <button className="button button--size-l" type="button" onClick={onResetClick}>
            Очистить
          </button>
          <button
            className="button button--size-l button--type-primary"
            type="button"
            onClick={onSaveClick}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
};

export default EditBadgeModal;
