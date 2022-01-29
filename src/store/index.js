import Vue from "vue";
import Vuex from "vuex";
import api from "../api/shop.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    products: [],
    cart: [],
  },
  mutations: {
    // Products (Invetory) Mutations 
    setProductsInventory(state, products) {
      state.products = products
    },
    // Product
    restoreProductInventory(state, product) {
      let productToIncrement = state.products.find(el => el.id === product.id)
      productToIncrement.inventory += product.amount
    },
    incrementProductInventory(state, product) {
      const productToIncrement = state.products.find(el => el.id === product.id)
      productToIncrement.inventory++
    },
    decreaseProductInventory(state, product) {
      const productToDecreaseInventory = state.products.find(el => el.id === product.id);
      productToDecreaseInventory.inventory--;
    },

    // -**********************************-

    // Cart Mutations
    addProductToCart(state, item) {
      state.cart.push({
        id: item.id,
        amount: 1,
      })
    },
    removeProductFromCart(state, indexItem) {
      state.cart.splice(indexItem, 1)
    },
    incrementProductInCart(state, item) {
      const productToIncrement = state.cart.find(el => el.id === item.id);
      productToIncrement.amount++;
    },
    decreaseProductInCart(state, item) {
      const productToDecrease = state.cart.find(el => el.id === item.id);
      productToDecrease.amount--;
    },
  },
  actions: {
    getProducts(context) {
      return new Promise((resolve) => {
        api.getProducts((products) => {
          context.commit('setProductsInventory', products)
          resolve()
        })
      })
    },
    addProductToCart(context, product) {
      // ¿Existe inventario del producto? 
      if (product.inventory === 0) return

      // ¿Está el producto en el carrito?
      const item = context.state.cart.find(el => el.id === product.id)

      // 👇 Si no está, se agrega
      !item ?
        context.commit('addProductToCart', product) :
        // Si está, se aumenta su cantidad
        context.commit('incrementProductInCart', item)

      // Restar cantidad de inventario del producto
      context.commit('decreaseProductInventory', product)
    },
    removeProductFromCart({ commit, state }, indexItem) {
      const product = state.cart[indexItem]
      // Eliminar del carrito de compras
      commit('removeProductFromCart', indexItem)
      // Restaurar inventario del producto de turno
      commit('restoreProductInventory', product)
    },
    decreaseProductInCart({ commit, state }, indexItem) {
      const product = state.cart[indexItem]
      // Remover uno de la cantidad del producto
      commit('decreaseProductInCart', product)
      // Añadir uno al inventario
      commit('incrementProductInventory', product)
    },
  },
  getters: {
    productsOnStock: state => state.products.filter(product => product.inventory > 0),
    productsInCart: state => {
      // -**********************************-
      // Construir un arrary con base en los productos del carrito.

      // Para tener el 'title' y el 'price' de cada item...
      const itemsInCart = state.cart.map(item => {
        // ...es necesario buscar cada item del carrito en el array
        // de todos los productos para poder extraer su 'title' y el 'price'.
        const currentProduct = state.products.find(el => el.id === item.id)
        return {
          title: currentProduct.title,
          price: currentProduct.price,
          amount: item.amount
        }
      })
      // -**********************************-
      // Retornar solo los items que tengan almenos 1 elemento
      return itemsInCart.filter(item => item.amount > 0)
    }
  },
  modules: {}
});
