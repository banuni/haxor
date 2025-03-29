import { useMutation, useQuery } from '@tanstack/react-query';
import { createServerFn, useServerFn } from '@tanstack/react-start';

const simpleStore = {
  username: 'user',
  systemLevel: 'basic',
  setUsername: (username: string) => {
    simpleStore.username = username;
  },
  setSystemLevel: (systemLevel: string) => {
    simpleStore.systemLevel = systemLevel;
  },
};

const getSessionDataEP = createServerFn({
  method: 'GET',
}).handler(async () => {
  return { username: simpleStore.username, systemLevel: simpleStore.systemLevel };
});

const setSessionDataEP = createServerFn({
  method: 'POST',
})
  .validator(({ username, systemLevel }: { username?: string; systemLevel?: string }) => ({
    username,
    systemLevel,
  }))
  .handler(async (ctx) => {
    if (typeof ctx.data.username === 'string') {
      simpleStore.setUsername(ctx.data.username);
    }
    if (typeof ctx.data.systemLevel === 'string') {
      simpleStore.setSystemLevel(ctx.data.systemLevel);
    }
  });

export const useSessionData = ({
  onUserNameChange,
  onSystemLevelChange,
}: { onUserNameChange?: (newName: string) => void; onSystemLevelChange?: (newSystemLevel: string) => void } = {}) => {
  const getSessionData = useServerFn(getSessionDataEP);
  const setSessionData = useServerFn(setSessionDataEP);
  const getSessionDataQuery = useQuery({
    queryKey: ['getSessionData'],
    queryFn: () => getSessionData(),
  });
  const setUserName = (username: string) => {
    return setSessionData({ data: { username } });
  };
  const setSystemLevel = (systemLevel: string) => {
    return setSessionData({ data: { systemLevel } });
  };
  const { mutate: setUserNameMutation } = useMutation({
    mutationFn: setUserName,
    onSuccess: (_data, variables) => {
      getSessionDataQuery.refetch().then(() => onUserNameChange?.(variables));
    },
  });
  const { mutate: setSystemLevelMutation } = useMutation({
    mutationFn: setSystemLevel,
    onSuccess: (_data, variables) => {
      getSessionDataQuery.refetch().then(() => onSystemLevelChange?.(variables));
    },
  });
  return { getSessionDataQuery, setUserNameMutation, setSystemLevelMutation };
};
