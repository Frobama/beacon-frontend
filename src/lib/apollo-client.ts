import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function makeClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:3001/graphql',
    }),
    cache: new InMemoryCache(),
  });
}
