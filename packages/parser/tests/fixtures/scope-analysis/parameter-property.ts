import { InjectRepository, Repository, User } from 'test';

export default class Foo {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
}
