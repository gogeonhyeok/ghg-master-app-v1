import Modify from '../../modify';
export default ({ params }) => {
  console.log(params)
  return (
    <>
      <Modify id={params.id}/>
    </>
  );
}
