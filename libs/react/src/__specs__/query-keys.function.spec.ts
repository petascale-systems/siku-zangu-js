import { queryKeys } from '../query-keys.function';

describe('queryKeys', () => {
  it('gives each resource its own namespace', () => {
    expect(queryKeys.users.all()[0]).toBe('users');
    expect(queryKeys.admins.all()[0]).toBe('admins');
    expect(queryKeys.articles.all()[0]).toBe('articles');
  });

  // A list key must start with its list prefix, or invalidating the prefix
  // after a create/delete would not reach the cached pages.
  it.each([
    ['users', queryKeys.users.lists(), queryKeys.users.list({ page: 2 })],
    ['admins', queryKeys.admins.lists(), queryKeys.admins.list({ page: 2 })],
    ['articles', queryKeys.articles.lists(), queryKeys.articles.list({ page: 2 })],
  ])('%s list keys are prefixed by the list key', (_n, prefix, key) => {
    expect(key.slice(0, prefix.length)).toEqual([...prefix]);
  });

  it('separates pages and searches into distinct cache entries', () => {
    expect(queryKeys.users.list({ page: 1 })).not.toEqual(
      queryKeys.users.list({ page: 2 })
    );
    expect(queryKeys.users.list({ q: 'amina' })).not.toEqual(
      queryKeys.users.list({ q: 'zawadi' })
    );
  });

  it('treats no params and empty params as the same entry', () => {
    expect(queryKeys.users.list()).toEqual(queryKeys.users.list({}));
  });

  it('keeps a detail key separate from a list key', () => {
    expect(queryKeys.users.detail('u1')).not.toEqual(queryKeys.users.list());
  });

  it('scopes details by id', () => {
    expect(queryKeys.articles.detail('a1')).not.toEqual(
      queryKeys.articles.detail('a2')
    );
  });
});
