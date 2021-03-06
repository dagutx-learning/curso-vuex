export default {
    state: {
        cart: [],
    },
    mutations: {
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
        emptyCart(state) {
            state.cart = []
        },
    },
    actions: {
        addProductToCart(context, product) {
            // ¿Existe inventario del producto? 
            if (product.inventory === 0) return

            // ¿Está el producto en el carrito?
            const item = context.state.cart.find(el => el.id === product.id)

            // Si está, se aumenta su cantidad
            item
                ? context.commit('incrementProductInCart', item)
                // 👇 Si no está, se agrega
                : context.commit('addProductToCart', product)

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
        productsInCart: (state, getters, rootState) => {
            // -**********************************-
            // Construir un arrary con base en los productos del carrito.

            // Para tener el 'title' y el 'price' de cada item...
            const itemsInCart = state.cart.map(item => {
                // ...es necesario buscar cada item del carrito en el array
                // de todos los productos para poder extraer su 'title' y el 'price'.
                const currentProduct = rootState.products.products.find(el => el.id === item.id)
                return {
                    title: currentProduct.title,
                    price: currentProduct.price,
                    amount: item.amount
                }
            })
            // -**********************************-
            // Retornar solo los items que tengan almenos 1 elemento
            return itemsInCart.filter(item => item.amount > 0)
        },
        cartTotalPrice: (state, getters) => {
            return getters.productsInCart.reduce((total, curr) => total + curr.price * curr.amount, 0)
        },
    },
}