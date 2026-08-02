import Modify from '../../modify';
export default async props => {
  const params = await props.params;
  console.log(params)
  return (
    <>
      <Modify id={params.id}/>
    </>
  );
};
