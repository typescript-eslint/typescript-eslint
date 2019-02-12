import { InjectRepository, Repository, User } from 'test';

export default class Foo {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {}
}
