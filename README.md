# Pre Entrega 3

&nbsp;

## Correr el proyecto:

###

- git clone https://github.com/Matias8776/PreEntrega3-Backend-Carballo.git
- cd PreEntrega3-Backend-Carballo
- npm i
- npm start

## Vista de productos:

###

- http://localhost:8080/products

- Parámetros(opcionales):
  ?limit=5,
  ?page=2,
  ?category=electronica,
  ?sort=asc o desc,
  ?disponibility=1 o 0

## Vista de carrito por ID:

###

- http://localhost:8080/carts/:cid

## Chat:

###

- http://localhost:8080/chat

## Productos en tiempo real:

###

- http://localhost:8080/realtimeproducts

## Mostrar productos:

###

- GET localhost:8080/api/products

## Buscar producto por ID:

###

- GET localhost:8080/api/products/:pid

## Mostrar productos con limite:

###

- GET localhost:8080/api/products?limit=

## Agregar producto:

###

- POST localhost:8080/api/products

```javascript
{
    "title": "",
    "description": "",
    "price": 500,
    "code": "",
    "stock": 10,
    "status": true,
    "category": ""
}
```

## Actualizar producto por ID:

###

- PUT localhost:8080/api/products/:pid

```javascript
{
    "title": "producto actualizado"
}
```

## Eliminar producto por ID:

###

- DELETE localhost:8080/api/products/:pid

## Crear carrito:

###

- POST localhost:8080/api/carts

## Agregar producto a carrito:

###

- POST localhost:8080/api/carts/:cid/product/:pid

## Buscar carrito por ID:

###

- GET localhost:8080/api/carts/:cid

## Actualizar carrito entero:

###

- PUT localhost:8080/api/carts/:cid

```javascript
[
  {
    _id: { _id: '64fca344bc7da40deee9e304' },
    quantity: 1
  },
  {
    _id: { _id: '64fca344bc7da40deee9e305' },
    quantity: 14
  }
];
```

## Actualizar cantidad de un producto en carrito:

###

- PUT localhost:8080/api/carts/:cid/products/:pid

```javascript
{
  "quantity": 3
}
```

## Eliminar producto del carrito por ID:

###

- DELETE localhost:8080/api/carts/:cid/products/:pid

## Vaciar Carrito:

###

- DELETE localhost:8080/api/carts/:cid
