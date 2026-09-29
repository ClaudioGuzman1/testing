// tests/test-runner.js - Framework de tests simple

class TestRunner {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Agregar un test
   * @param {String} description - Descripción del test
   * @param {Function} testFn - Función de test
   */
  test(description, testFn) {
    this.tests.push({ description, testFn });
  }

  /**
   * Aserciones
   */
  static assert = {
    equal: (actual, expected, message = '') => {
      if (actual !== expected) {
        throw new Error(`Assert failed: ${message}\nExpected: ${expected}, Got: ${actual}`);
      }
    },

    strictEqual: (actual, expected, message = '') => {
      if (actual !== expected || typeof actual !== typeof expected) {
        throw new Error(`Assert failed: ${message}`);
      }
    },

    deepEqual: (actual, expected, message = '') => {
      const equal = JSON.stringify(actual) === JSON.stringify(expected);
      if (!equal) {
        throw new Error(`Assert failed: ${message}\nExpected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
      }
    },

    isTrue: (value, message = '') => {
      if (value !== true) {
        throw new Error(`Assert failed: ${message} - Expected true but got ${value}`);
      }
    },

    isFalse: (value, message = '') => {
      if (value !== false) {
        throw new Error(`Assert failed: ${message} - Expected false but got ${value}`);
      }
    },

    throws: (fn, message = '') => {
      try {
        fn();
        throw new Error(`Assert failed: ${message} - Expected function to throw`);
      } catch (e) {
        if (e.message.includes('Assert failed')) throw e;
      }
    },

    ok: (value, message = '') => {
      if (!value) {
        throw new Error(`Assert failed: ${message} - Expected truthy value`);
      }
    },

    notOk: (value, message = '') => {
      if (value) {
        throw new Error(`Assert failed: ${message} - Expected falsy value`);
      }
    },

    includes: (array, value, message = '') => {
      if (!array.includes(value)) {
        throw new Error(`Assert failed: ${message} - Array does not include value`);
      }
    },

    doesNotInclude: (array, value, message = '') => {
      if (array.includes(value)) {
        throw new Error(`Assert failed: ${message} - Array includes value`);
      }
    }
  };

  /**
   * Ejecutar todos los tests
   */
  async run() {
    console.group(`📋 ${this.name}`);

    for (const { description, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${description}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${description}`);
        console.log(`   ${error.message}`);
        this.failed++;
      }
    }

    console.groupEnd();
    return {
      name: this.name,
      passed: this.passed,
      failed: this.failed,
      total: this.tests.length
    };
  }

  /**
   * Obtener reporte
   */
  getReport() {
    const success = this.failed === 0;
    return {
      suite: this.name,
      passed: this.passed,
      failed: this.failed,
      total: this.tests.length,
      success,
      percentage: Math.round((this.passed / this.tests.length) * 100)
    };
  }
}

/**
 * Ejecutor de múltiples suites de tests
 */
class TestSuite {
  constructor() {
    this.runners = [];
  }

  addSuite(runner) {
    this.runners.push(runner);
  }

  async run() {
    console.log('🧪 Ejecutando tests...\n');

    const results = [];
    for (const runner of this.runners) {
      const result = await runner.run();
      results.push(result);
    }

    // Resumen
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = results.reduce((sum, r) => sum + r.total, 0);

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(50));
    console.table(results);
    console.log(`\n✅ Pasados: ${totalPassed}/${totalTests}`);
    console.log(`❌ Fallidos: ${totalFailed}/${totalTests}`);
    console.log(`📈 Porcentaje: ${Math.round((totalPassed / totalTests) * 100)}%`);
    console.log('='.repeat(50) + '\n');

    return results;
  }
}
