export const getUserData: any = () => {
  const data: any = localStorage.getItem("USERDATA");
  try {
    return JSON.parse(data)
  } catch (error) {
    return null;
  }
}
