#include <iostream>
#include <bitset>
#include <cstring>
using namespace std;

union FloatToBinary {
    float value;
    unsigned int bits;
};

string toBinary(float num) {
    FloatToBinary fb;
    fb.value = num;
    bitset<32> b(fb.bits);
    return b.to_string();
}

void printIEEE(string label, float num) {
    cout << label << endl;
    cout << "Decimal: " << num << endl;
    cout << "Binary : " << toBinary(num) << endl << endl;
}

int main() {
    float a, b;

    cout << "Enter first decimal number: ";
    cin >> a;

    cout << "Enter second decimal number: ";
    cin >> b;

    float sum = a + b;
    float product = a * b;

    cout << "\n===== IEEE 754 Representation =====\n\n";

    printIEEE("Operand 1:", a);
    printIEEE("Operand 2:", b);
    printIEEE("Sum:", sum);
    printIEEE("Product:", product);

    return 0;
}