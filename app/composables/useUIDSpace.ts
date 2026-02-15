const uid = ref(0);

const space = (base: number) => ({ get: (id: number) => `${base}-${id}` });

export const useUIDSpace = () => {
  return { uidSpace: space(uid.value++) };
};
