import { Args, ArgsType, Field, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AnimalService } from './animal.service';

@ArgsType()
class GetOrgArgs {
  @Field(() => String)
  orgFirst: string;
}

@ArgsType()
class getIdArgs {
  @Field(() => String)
  id: string;
}

@Resolver('Animal')
export class AnimalResolver {
  constructor(private readonly animalService: AnimalService) {}

  @Query()
  async getAnimals() {
    const data = await this.animalService.getAnimals();
    return data;
  }

  @Query()
  async animal(@Args() args: getIdArgs) {
    const data = await this.animalService.getAnimal(args.id);
    return data;
  }

  @Mutation()
  async hitAnimal(@Args() args: getIdArgs) {
    const data = await this.animalService.setHitAnimal(args.id);
    return data;
  }
}

@Resolver('Org')
export class OrgResolver {
  constructor(private readonly animalService: AnimalService) {}

  @Query()
  async org(@Args() args: GetOrgArgs) {
    return await this.animalService.getDetailOrg(args.orgFirst);
  }
}
