import { createRoot } from 'react-dom/client'
import * as React from 'react'
import { getAllFromStorage, Marks } from '../utils/storage'
import EditBadgeModal from '../components/EditBadgeModal'
import './styles.css'

chrome.runtime.sendMessage({}, () => {
  const checkReady = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(checkReady)
      init()
    }
  })
})

let badges: Marks = {}

const init = async () => {
  let timer: NodeJS.Timeout

  badges = (await getAllFromStorage()) || {}

  // Get page content
  const pageWrapper = document.querySelector('#app > .layout > .view')
  if (!pageWrapper) throw new Error('[DTF Remarks] Page wrapper not found')

  // Observe
  const observerConfig = { subtree: true, childList: true }
  const observer = new MutationObserver((list: MutationRecord[]) => {
    list
      .filter(({ type }) => type === 'childList')
      .forEach(({ target }) => {
        const classIgnoreList = ['subsite-header__name', 'comment', 'author__name']

        const classList = (target as HTMLElement).classList

        if (pageWrapper !== target) {
          for (const token of classIgnoreList) {
            if (classList.contains(token)) {
              return
            }
          }
        }

        clearTimeout(timer)
        timer = setTimeout(() => updatePage(pageWrapper), 50)
      })
  })
  observer.observe(pageWrapper, observerConfig)

  await updatePage(pageWrapper)
}

const updatePage = async (target: Element) => {
  await updateProfileHeader(target)
  updateAuthors(target)
}

const addEditBadgeModal = (id: number, target: Element) => {
  const modalContainer = document.querySelector('#app')
  if (!modalContainer) throw new Error('[DTF Remarks] Modal container not found')

  const modalWrapper = document.createElement('div')
  modalWrapper.classList.add('modal-overlay', 'modal-overlay--fit-default', 'modal-badge')
  modalContainer.appendChild(modalWrapper)
  modalWrapper.addEventListener('click', ({ target, currentTarget }) => {
    if (target === currentTarget) modalWrapper.remove()
  })

  const afterSave = async () => {
    badges = await getAllFromStorage()
    await updateProfileHeader(target)
    updateAuthors(target)
  }

  // Render react component with callback and user's id as props
  const root = createRoot(modalWrapper)
  root.render(React.createElement(EditBadgeModal, { id, afterSave }))
}

const updateAuthors = (target: Element) => {
  target
    .querySelectorAll('.comments .comment:not(.comment--removed):not(.comment--writing), .content')
    .forEach(updateAuthor)
}

const updateProfileHeader = async (target: Element) => {
  const userId = getUserId()
  if (!userId) return

  const container = target.querySelector('.subsite-card__name')
  if (!container) return

  const { text = 'нейтрально', type = 'blue' } = badges[userId] || {}
  const isNegative = type === 'red'
  const negativeClassName = 'profile__badge-red'

  const currentBadge = container?.querySelector('.profile__badge')

  // If badge is correct, keep it, otherwise generate new
  if (currentBadge) {
    const { classList } = currentBadge

    // if text is wrong or class is not correct
    if (
      currentBadge.innerHTML !== text ||
      (isNegative && !classList.contains(negativeClassName)) ||
      (!isNegative && classList.contains(negativeClassName))
    ) {
      currentBadge.remove()
    } else {
      return
    }
  }

  // Build mark up
  const button = document.createElement('div')
  button.classList.add('profile__badge')
  button.setAttribute('title', 'Нажмите для редактирования')
  button.classList.toggle(negativeClassName, type === 'red')
  button.addEventListener('click', () => addEditBadgeModal(userId, target))
  button.innerHTML = text
  container.appendChild(button)
}

const updateAuthor = async (comment: Element) => {
  const nameLink = comment.querySelector('.author__name')
  const currentBadge = comment.querySelector('.comments__item__badge')
  if (!nameLink) return

  // Get user's id from comment
  const urlMatch = nameLink.getAttribute('href')?.match(/id(\d+)/) as [string, number]
  if (!urlMatch) return

  const [, id] = urlMatch
  if (!id) return

  // Get data from storage
  if (!badges[id]) {
    currentBadge?.remove()
    return
  }

  const { text = 'нейтрален', type = 'blue' } = badges[id]
  const isNegative = type === 'red'
  const negativeClassName = 'comments__item__badge-red'

  // Remove previously added badge
  if (currentBadge) {
    const { classList } = currentBadge

    // if text is wrong or class is not correct
    if (
      currentBadge.innerHTML !== text ||
      (isNegative && !classList.contains(negativeClassName)) ||
      (!isNegative && classList.contains(negativeClassName))
    ) {
      currentBadge?.remove()
    } else {
      return
    }
  }

  // Build mark up
  const badgeElement = document.createElement('div')
  badgeElement.innerHTML = text
  badgeElement.classList.toggle(negativeClassName, type === 'red')
  badgeElement.classList.add('comments__item__badge')

  comment.querySelector('.author__name')?.appendChild(badgeElement)
}

const getUserId = (): number => {
  const [, id] = (window.location.pathname.match(/id(\d+)/) as [string, number]) ?? ['', 0]
  return id
}
