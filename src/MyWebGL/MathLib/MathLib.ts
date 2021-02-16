class MathLib {
    public static radiansToDegree(radians: number) {
        return radians * (180.0 / Math.PI);
    }

    public static degreeToRadians(degree: number) {
        return degree * (Math.PI / 180.0);
    }

    public static sineTheorem(source: number, degreeSource: number, degreeTarget: number) {
        return source / Math.sin(MathLib.degreeToRadians(degreeSource)) * 
            Math.sin(MathLib.degreeToRadians(degreeTarget));
    }

    
    
}


export { MathLib };