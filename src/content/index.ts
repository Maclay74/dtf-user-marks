import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { getAllFromStorage, StorageArg } from '../utils/storage';
import EditBadgeModal, { EditBadeModalProps } from '../components/EditBadgeModal';
import { FC, ReactElement } from 'react';

chrome.runtime.sendMessage({}, (response) => {
  const checkReady = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(checkReady);
      init();
    }
  });
});


let badges: StorageArg = {};

const init = async () => {
  let timer: ReturnType<typeof setTimeout>;

  badges = await getAllFromStorage() || {};

  // Observe
  const pageWrapper = document.querySelector('#page_wrapper');
  const observerConfig = { subtree: true, childList: true };
  if (!pageWrapper) return;

  const callback = (list: MutationRecord[]) => {
    list.filter(({ type }) => type === 'childList')
      .forEach(({ target }) => {
        clearTimeout(timer);
        timer = setTimeout(() => updatePage(pageWrapper as HTMLElement), 50);
      });
  };

  const observer = new MutationObserver(callback);
  observer.observe(pageWrapper, observerConfig);

  updatePage(pageWrapper as HTMLElement);

};

const updatePage = (target: HTMLElement) => {
  // user page, probably private post
  if (window.location.pathname.match(/\/u\/([\d]+)/)) {
    // If have /u/ in url, it profile page
    if (!window.location.pathname.match(/\/u\/([\d]+)([^!\/]+)\//)) {
      updateProfile(target);
    } else {
      updateArticle(target);
    }
  } else {
    updateArticle(target);
  }
};

const addEditBadgeModal = (id: string, target: HTMLElement) => {
  const modalContainer = document.querySelector('.layout__content');

  // If modal wasn't added yet by any other occasion
  if (!modalContainer?.querySelector('.v-popup-fp-container')) {
    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('v-popup-fp-container');
    document.querySelector('.layout__content')?.appendChild(modalWrapper);
  }

  const modalWrapper = modalContainer?.querySelector('.v-popup-fp-container');
  const afterSave = async () => {
    badges = await getAllFromStorage();
    await updateProfile(target);
  };

  // Render react component with callback and user's id as props
  const component = React.createElement<EditBadeModalProps>(EditBadgeModal as FC, { id, afterSave });
  // @ts-ignore
  ReactDOM.render(component, modalWrapper);
};

const updateArticle = (target: Element) => {

  const commentsElement = target.querySelector('.comments');
  if (!commentsElement) return;

  commentsElement
    .querySelectorAll('.comment:not(.comment--removed)')
    .forEach(updateComment);
};

const updateProfile = async (target: Element) => {

  badges = await getAllFromStorage() || {};

  const container = target.querySelector('.v-header-title__main');
  if (!container) return;

  // Remove previously added badge
  const component = container.querySelector('.profile__badge');
  component?.remove();

  // Not profile page
  const [, id] = window.location.pathname.match(/\/u\/([\d]+)/) as [string, string];
  if (!id) return;

  // Get data from storage
  const { text = 'нейтрально', type = 'blue' } = badges[id] || {};

  // Build mark up
  const button = document.createElement('div');
  button.classList.add('v-header-title__item', 'profile__badge');
  button.setAttribute('title', 'Нажмите для редактирования');
  button.classList.toggle('profile__badge-red', type === 'red');
  button.addEventListener('click', () => addEditBadgeModal(id, target as HTMLElement));
  button.innerHTML = text;
  container.appendChild(button);
};

const updateComment = async (comment: Element) => {
  if (!comment) return;

  try {
    // Get user's id from comment
    const urlMatch = comment
      .querySelector('.comment__author')
      ?.getAttribute('href')
      ?.match(/\/u\/([\d]+)/);

    if (!urlMatch) return;
    const [, id] = urlMatch;
    if (!id) return;

    // Get data from storage
    if (!badges[id]) return;

    const { text = 'нейтрально', type = 'blue' } = badges[id];

    // Remove previously added badge
    const component = comment.querySelector('.comments__item__badge');
    component?.remove();

    // Build mark up
    const badgeElement = document.createElement('div');
    badgeElement.innerHTML = text;
    badgeElement.classList.toggle('comments__item__badge-red', type === 'red');
    badgeElement.classList.add('comments__item__badge');

    comment
      ?.querySelector('.comment__author')
      ?.appendChild(badgeElement);

  } catch (e) {
    console.log(comment, e);
  }

};
