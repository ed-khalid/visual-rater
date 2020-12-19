import graphql.TypeResolutionEnvironment;
import graphql.schema.GraphQLObjectType;
import graphql.schema.TypeResolver;

public class JavaKotlinScratch {

    public void doSomething()  {
        TypeResolver t = new TypeResolver()  {
            @Override
            public GraphQLObjectType getType(TypeResolutionEnvironment e) {
                Object jObject = e.getObject();
                if (jObject instanceof String) {
                    return e.getSchema().getObjectType("a");
                } else if (jObject instanceof Integer) {
                    return e.getSchema().getObjectType("b");
                } else {
                     return e.getSchema().getObjectType("t");
                }

            }
        };
    }









}
