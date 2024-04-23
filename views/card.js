//const stripe = Stripe('pk_test_51IsQPvSHGcil8cZZji6L5yDJKm8cYvGZJfVdDqPbApVubE8QYj6yENDLNQmdHXsvF0fSapIbA2NObJ7T9deM7Smb00CscN1ji6');
// const stripe = Stripe('pk_test_51NJ8LhSDjVnkPYiF81ht6mEWbrxqBrdoS0Vz9Ye1lzOGmwnbyJQNw1a3gGkzlj2G5JwtmKr6WdVgSgBh4AGtiXpg004l3yHsng');
//const stripe = Stripe('pk_test_51IsQPvSHGcil8cZZji6L5yDJKm8cYvGZJfVdDqPbApVubE8QYj6yENDLNQmdHXsvF0fSapIbA2NObJ7T9deM7Smb00CscN1ji6');
const stripe = Stripe('pk_test_51IsQPvSHGcil8cZZji6L5yDJKm8cYvGZJfVdDqPbApVubE8QYj6yENDLNQmdHXsvF0fSapIbA2NObJ7T9deM7Smb00CscN1ji6');

const elements = stripe.elements();

var style = {
    base: {
        color: "#fff"
    }
}
const card = elements.create('card', {
    style
});
card.mount('#card-element');

const form = document.querySelector('form');
const errorEl = document.querySelector('#card-errors');

const stripeTokenHandler = token => {
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    console.log("form", form)
    form.submit();
}

form.addEventListener('submit', e => {
    e.preventDefault();

    stripe.createToken(card).then(res => {
        if (res.error) errorEl.textContent = res.error.message;
        else {
            console.log("token", res.token);
            stripeTokenHandler(res.token);
        }
    })
})