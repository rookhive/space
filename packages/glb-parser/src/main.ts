import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { cloneDocument } from '@gltf-transform/functions';
import type { Collision } from '@repo/typesystem';

const OUT_DIRECTORY = 'dist';

async function processGlbModels() {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

  mkdirSync(OUT_DIRECTORY, { recursive: true });

  const modelFiles = readdirSync('models').filter((file) => extname(file) === '.glb');

  for (const file of modelFiles) {
    const modelName = basename(file, '.glb');
    const document = await io.read(join('models', file));

    const collisionData: Collision[] = [];
    const visualDocument = cloneDocument(document);

    const collisionNodes = document
      .getRoot()
      .listNodes()
      .filter(
        (node) => node.getName().endsWith('_collision') || node.getName().endsWith('_static')
      );

    const visualNodes = visualDocument
      .getRoot()
      .listNodes()
      .filter((node) => node.getName().endsWith('_visual') || node.getName().endsWith('_static'));

    for (const node of collisionNodes) {
      const mesh = node.getMesh();
      if (!mesh) continue;

      const primitive = mesh.listPrimitives()[0];
      if (!primitive) continue;
      const position = primitive.getAttribute('POSITION');
      const indices = primitive.getIndices();

      if (position && indices) {
        const positionArray = position.getArray();
        const indicesArray = indices.getArray();

        if (positionArray && indicesArray) {
          const matrix = node.getWorldMatrix();

          const scaleX = Math.sqrt(
            matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]
          );
          const scaleY = Math.sqrt(
            matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]
          );
          const scaleZ = Math.sqrt(
            matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10]
          );

          collisionData.push({
            name: node.getName(),
            type: node.getName().endsWith('_static') ? 'static' : 'collision',
            vertices: Array.from(positionArray),
            indices: Array.from(indicesArray),
            position: [matrix[12], matrix[13], matrix[14]],
            rotation: [0, 0, 0, 1],
            scale: [scaleX, scaleY, scaleZ],
          });
        }
      }
    }

    for (const node of visualDocument.getRoot().listNodes()) {
      if (!visualNodes.includes(node)) node.dispose();
    }

    writeFileSync(
      join(OUT_DIRECTORY, `${modelName}.collision.json`),
      JSON.stringify(collisionData)
    );

    writeFileSync(
      join(OUT_DIRECTORY, `${modelName}.visual.glb`),
      await io.writeBinary(visualDocument)
    );
  }
}

processGlbModels();
