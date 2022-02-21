const cartDataLayer = require('../dal/cart_items');

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async getAllCartItems() {
        const allCartItems = await cartDataLayer.getCart(this.user_id);
        return allCartItems;
    }

    async addToCart(productId, quantity) {
        let cartItem = await cartDataLayer.getCartItemByUserAndProduct(this.user_id, productId);
        if (cartItem) {
            cartDataLayer.updateCartItem(this.user_id, productId, cartItem.get('quantity') + quantity)
        } else {
             // todo: check whether if there is enough stock       
             await cartDataLayer.createCartItem(this.user_id, productId, quantity);
        }
        return cartItem;
    }

    async updateQuantity(productId, newQuantity) {
        let status = await cartDataLayer.updateCartItem(this.user_id, productId, newQuantity);
        return status;
    }
}

module.exports = CartServices;