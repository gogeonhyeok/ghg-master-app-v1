const SingaporeAirlinesLandingPage = () => {
  return (
    <div className="font-sans text-center p-5">
      <header className="bg-blue-900 text-white py-4">
        <h1 className="text-3xl">Welcome to Singapore Airlines</h1>
      </header>
      <section className="my-8">
        <h2 className="text-2xl mb-4">Experience the Best in Air Travel</h2>
        <p className="text-lg">
          Singapore Airlines is known for its exceptional service, luxurious cabins, and world-class entertainment.
          Fly with us and experience the difference.
        </p>
      </section>
      <section className="my-8">
        <h2 className="text-2xl mb-4">Our Destinations</h2>
        <p className="text-lg">
          We fly to over 130 destinations worldwide. Whether you're traveling for business or leisure, we have a destination for you.
        </p>
      </section>
      <section className="my-8">
        <h2 className="text-2xl mb-4">Book Your Flight</h2>
        <button className="px-6 py-2 bg-blue-900 text-white rounded-sm">
          Book Now
        </button>
      </section>
      <footer className="bg-blue-900 text-white py-4 mt-8">
        <p>&copy; 2023 Singapore Airlines. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SingaporeAirlinesLandingPage;
