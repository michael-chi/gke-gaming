module.exports = class GameConfiguration{
    static DataAccess(){
        return {
            PROJECT_ID : process.env.PROJECT_ID,
            INSTANCE_ID : process.env.INSTANCE_ID,
            DATABASE_ID : process.env.DATABASE_ID
        };
    }
}