import './scss/styles.scss';

import {LarekAPI} from './components/Model/LarekAPI';
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {IOrderForm,IOrder} from "./types";
import {cloneTemplate,ensureElement} from "./utils/utils";
import {AppData,CatalogChangeEvent,ProductItem} from './components/Model/AppData';
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/View/Basket";
import {Card,CardInBasket} from "./components/View/Card";
import {OrderForm,ContactsForm} from "./components/View/Order";
import {Page} from "./components/View/Page";
import {Success} from "./components/View/Success";

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalCardTemplate = ensureElement<HTMLTemplateElement>('#modal-container');


// Модель данных приложения

const appData = new AppData({}, events);


// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(modalCardTemplate, events);



// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate<HTMLTemplateElement>(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate),	events);

const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();  
	},
});	

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Карточки
// Изменились элементы каталога
events.on<CatalogChangeEvent>('catalog:changed', () => {
	page.catalog = appData.catalog.map((item: ProductItem) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item)
		});
		
		return card.render({
		  image: item.image,
		  title: item.title,
		  category: item.category,
		  price: item.price,
		  description: item.description,
		});
	});
  });

// получаем карточки с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

	//открываем превью
events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});


  //изменения в откр карточке
  events.on('preview:change', (item: ProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
			

            if (appData.isInBasket(item)) {
                appData.deleteFromBasket(item);
                card.button = 'В корзину';
            } else {
                appData.addToBasket(item);
                card.button = 'Удалить из корзины';
                modal.close();
            }
        },
    });

    //текст при наличии? товара в корзине
	card.button = appData.isInBasket(item) ? 'Удалить из корзины' : 'В корзину';

    modal.render({ 
        content: card.render(item) 
    });
});

 //корзина
//открываем корзину
events.on('basket:open', () => {
	modal.render({
		content:basket.render()
	});
});

//изменения в корзине
events.on('basket:changed', () => {
	page.counter = appData.getBasketVolume();//кол-во товара в корзине
		basket.items = appData.basket.items.map((id, index) => {
			const itemBasket = appData.catalog.find(item => item.id === id);
			const cardBasket = new CardInBasket(cloneTemplate(basketCardTemplate), {
				onClick: () => {
					appData.deleteFromBasket(itemBasket);
				},

			});

		itemBasket.index = index +1;//нумерация
	
		return cardBasket.render({
			title: itemBasket.title,
			price: itemBasket.price,
			index: itemBasket.index,
		});	
	})
	basket.total = appData.getTotal();// сумма итого
});


// Форма заказа
//адрес и оплата
events.on('order:open', () => {
	appData.clearOrder();
	modal.render({
		content: orderForm.render({
			payment: 'online',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

//контакты и подтверждение
events.on('order:submit', () => {
	modal.render({
		content: contactsForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

 
// валидация
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
    const { payment, address  } = errors;
    orderForm.valid = !payment && !address;
    orderForm.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});
events.on('contactsFormErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    contactsForm.valid = !email && !phone;
    contactsForm.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей формы
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
    appData.validateOrder();
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setContactsField(data.field, data.value);
    appData.validateContacts();
});

//заказ готов
events.on('contacts:submit', () => {
	const orderData = appData.getOrder();
	
	  api.createOrder(orderData)
		  .then(() => {
			  modal.render({ 
				content: success.render() 
			});
			  success.total = appData.basket.total;
		  })
		  .then(() => {
			appData.clearBasket();
			events.emit('basket:changed');
		})
		.catch(err => {
			console.error(err);
		});
  });

// Блокируем/разблокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});



