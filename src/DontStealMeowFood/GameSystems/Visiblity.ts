import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

export default class Visiblity{
    private static startTileIndex : Vec2 = Vec2.ZERO;
    private static endTileIndex : Vec2 = Vec2.ZERO;
    private static zeroPos : Vec2 = Vec2.ZERO;
    private static tilePos: Vec2 = Vec2.ZERO;
    private static colliderTileAABB : AABB = new AABB();

    static positionsVisible(pos1 : Vec2, pos2 : Vec2, vision: number, collidableMap : OrthogonalTilemap) : Vec2 {
        let difference = pos1.clone().sub(pos2);
        //pos1 = playerPos; pos2 = myPos

        this.startTileIndex.x = Math.min(pos1.x, pos2.x);
        this.startTileIndex.y = Math.min(pos1.y, pos2.y);
        this.endTileIndex.x = Math.max(pos1.x, pos2.x);
        this.endTileIndex.y = Math.max(pos1.y, pos2.y);

        let startTileIndex = collidableMap.getColRowAt(this.startTileIndex);
        let endTileIndex = collidableMap.getColRowAt(this.endTileIndex);

        let tileSize = collidableMap.getTileSize();

        for(let col = startTileIndex.x; col<= endTileIndex.x; col++){
            for(let row = startTileIndex.y; row<=endTileIndex.y; row++){
                if(collidableMap.isTileCollidable(col,row)){
                    this.tilePos.x = col * tileSize.x + tileSize.x / 2; //x co-ordinate of collidable tile in webpage 
                    this.tilePos.y = row * tileSize.y + tileSize.y / 2; //y co-ordinate of collidable tile in webpage

                    this.colliderTileAABB.center = this.tilePos;
                    this.colliderTileAABB.halfSize = tileSize.scaled(0.5);

                    let hit = this.colliderTileAABB.intersectSegment(pos2, difference, this.zeroPos); //check if line segment betweem

                    if(hit !== null && pos2.distanceSqTo(hit.pos) < pos2.distanceSqTo(pos1)){
                        return null;
                    }
                }
            }
        }
        if (vision == -1) return pos1;

        let d = pos1.distanceSqTo(pos2);
        if(d <= Math.pow(vision, 2)){
            return pos1;
        }else{
            return null;
        }
    }
}