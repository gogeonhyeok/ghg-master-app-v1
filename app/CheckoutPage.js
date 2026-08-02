import { useEffect } from "react";

const CheckoutPage = () => {
  useEffect(() => {
    // Load PayPal script
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSuccess = (details, data) => {
    alert('Transaction completed by ' + details.payer.name.given_name);
    // OPTIONAL: Call your server to save the transaction
    return fetch('/paypal-transaction-complete', {
      method: 'post',
      body: JSON.stringify({
        orderID: data.orderID
      })
    });
  };

  return (
    <div className="font-sans text-center p-5">
      <header className="bg-blue-900 text-white py-4">
        <h1 className="text-3xl">Product Checkout</h1>
      </header>
      <section className="my-8">
        <h2 className="text-2xl mb-4">Order Summary</h2>
        <p className="text-lg">Product Name: Awesome Product</p>
        <p className="text-lg">Price: $99.99</p>
      </section>
      <section className="my-8">
        <h2 className="text-2xl mb-4">Payment</h2>
        <div className="flex justify-center">
          {/* <PayPalButton
            amount="99.99"
            onSuccess={(details, data) => handleSuccess(details, data)}
          /> */}
        </div>
      </section>
      <footer className="bg-blue-900 text-white py-4 mt-8">
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CheckoutPage;
