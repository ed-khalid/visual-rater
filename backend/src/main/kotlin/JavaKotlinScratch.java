import com.fasterxml.jackson.databind.ObjectMapper;
import com.hawazin.visrater.graphql.models.SongInput;
import graphql.TypeResolutionEnvironment;
import graphql.schema.GraphQLObjectType;
import graphql.schema.TypeResolver;

public class JavaKotlinScratch {

    private final ObjectMapper objectMapper = new ObjectMapper();


    private void convert() {
        objectMapper.convertValue(new Object(), SongInput.class);
    }

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
