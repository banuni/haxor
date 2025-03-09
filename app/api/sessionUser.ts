import { useMutation, useQuery } from '@tanstack/react-query';
import { createServerFn, useServerFn } from '@tanstack/react-start';

const simpleStore = {
  username: 'user',
  setUsername: (username: string) => {
    simpleStore.username = username;
  },
};

const getUserNameEndpoint = createServerFn({
  method: 'GET',
}).handler(async () => {
  return simpleStore.username;
});

const setUserNameEndpoint = createServerFn({
  method: 'POST',
})
  .validator((username: string) => username)
  .handler(async (ctx) => {
    simpleStore.setUsername(ctx.data);
  });

export const useSessionUser = ({ onChange }: { onChange?: (newName: string) => void } = {}) => {
  const getUserName = useServerFn(getUserNameEndpoint);
  const getUserNameQuery = useQuery({
    queryKey: ['getUserName'],
    queryFn: getUserName,
  });
  const setUserName = useServerFn(setUserNameEndpoint);
  const { mutate: setUserNameMutation } = useMutation({
    mutationFn: setUserName,
    onSuccess: (_data, variables) => {
      getUserNameQuery.refetch().then(() => onChange?.(variables.data));
    },
  });
  return { getUserNameQuery, setUserNameMutation };
};
