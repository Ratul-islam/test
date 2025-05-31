import * as THREE from 'three';
export const calculatePrice = (
    bodyPartName: string, 
    size: number, 
    getMeshRegion: (meshName: string) => string,
    decalGroup?: THREE.Mesh[]
): number => {
    const basePrice = 50;
    
    const priceMultipliers: { [key: string]: number } = {
        head: 3.5,
        neck: 3.2,
        foot_left: 3.0,
        foot_right: 3.0,
        hand_left: 2.8,
        hand_right: 2.8,
        hip: 2.4,
        torso_front: 2.2,
        torso_back: 2.0,
        shoulder_left: 1.8,
        shoulder_right: 1.8,
        arm_upper_left: 1.6,
        arm_upper_right: 1.6,
        arm_lower_left: 1.5,
        arm_lower_right: 1.5,
        leg_upper_left: 1.7,
        leg_upper_right: 1.7,
        leg_lower_left: 1.5,
        leg_lower_right: 1.5,
    };
    
    const primaryRegion = getMeshRegion(bodyPartName);
    const primaryMultiplier = priceMultipliers[primaryRegion] || 1.8;
    
    const sizeFactor = Math.pow(size * 10, 1.8);
    let complexityFactor = 1.0;
    
    if (['neck', 'hand_left', 'hand_right', 'foot_left', 'foot_right'].includes(primaryRegion)) {
        complexityFactor = 1.25;
    } else if (['head', 'hip'].includes(primaryRegion)) {
        complexityFactor = 1.15;
    }
    
    if (size < 0.08 && ['head', 'hand_left', 'hand_right', 'neck'].includes(primaryRegion)) {
        complexityFactor *= 1.2;
    }
    
    let finalPrice = basePrice * primaryMultiplier * sizeFactor * complexityFactor;
    
    if (decalGroup && decalGroup.length > 1) {
        const regionCoverage: { [region: string]: number } = {};
        let totalArea = 0;
        
        decalGroup.forEach(decalMesh => {
            if (decalMesh && decalMesh.geometry) {
                const meshBodyPart = decalMesh.userData.bodyPart || '';
                const region = getMeshRegion(meshBodyPart);
                const geo = decalMesh.geometry as THREE.BufferGeometry;
                const area = geo.attributes.position ? geo.attributes.position.count : 0;
                
                if (!regionCoverage[region]) regionCoverage[region] = 0;
                regionCoverage[region] += area;
                totalArea += area;
            }
        });
        
        if (Object.keys(regionCoverage).length > 1 && totalArea > 0) {
            let weightedMultiplier = 0;
            
            for (const [region, area] of Object.entries(regionCoverage)) {
                const regionMultiplier = priceMultipliers[region] || 1.8;
                const weightFactor = area / totalArea;
                weightedMultiplier += regionMultiplier * weightFactor;
            }
            
            if (regionCoverage['neck'] && (regionCoverage['torso_front'] || regionCoverage['torso_back'])) {
                const neckPercentage = regionCoverage['neck'] / totalArea;
                const neckPremium = neckPercentage * 0.5;
                complexityFactor *= (1 + neckPremium);
            }
            
            finalPrice = basePrice * weightedMultiplier * sizeFactor * complexityFactor;
            const regionCount = Object.keys(regionCoverage).length;
            if (regionCount > 2) {
                finalPrice *= (1 + (regionCount - 2) * 0.08);
            }
        }
    }
    
    return Math.round(finalPrice * 100) / 100;
};