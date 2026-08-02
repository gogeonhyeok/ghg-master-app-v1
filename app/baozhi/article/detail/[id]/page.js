import Detail from '../../detail';
export default async props => {
  const params = await props.params;
  return (
    <>
      <Detail id={params.id}/>
    </>
  );
};
