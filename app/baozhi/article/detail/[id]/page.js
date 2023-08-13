import Detail from '../../detail';
export default ({ params }) => {
  return (
    <>
      <Detail id={params.id}/>
    </>
  );
}
